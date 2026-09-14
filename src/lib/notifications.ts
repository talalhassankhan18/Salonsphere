// Notification creation + SSE fan-out, shared by the API routes and by
// server code that needs to notify without an HTTP round-trip
// (e.g. bookings/cancel). Route files must only export HTTP handlers, so
// the SSE client registry lives here instead of in api/notifications/route.ts.

import "server-only";
import Notification, { INotification } from "@/mongoose-models/Notification";
import Customer from "@/mongoose-models/Customer";
import Salon from "@/mongoose-models/Salon";

export type NotificationType = INotification["type"];
export type NotificationTarget = INotification["target"];

// ---------------------------------------------------------------------------
// SSE client registry (per server process)
// ---------------------------------------------------------------------------

const clients = new Map<string, WritableStreamDefaultWriter[]>();

export function addClient(userId: string, writer: WritableStreamDefaultWriter) {
  const list = clients.get(userId) || [];
  list.push(writer);
  clients.set(userId, list);
}

export function removeClient(userId: string, writer: WritableStreamDefaultWriter) {
  const list = (clients.get(userId) || []).filter((w) => w !== writer);
  if (list.length > 0) clients.set(userId, list);
  else clients.delete(userId);
}

export async function emitNotification(userId: string, payload: unknown) {
  const encoder = new TextEncoder();
  for (const writer of clients.get(userId) || []) {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
    } catch (error) {
      console.error("Error writing to SSE client:", error);
    }
  }
}

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------

export interface CreateNotificationInput {
  title: string;
  content: string;
  type: NotificationType;
  target: NotificationTarget;
  /** Required when target === "specific". */
  recipientIds?: string[];
  /** Required when target === "salonAdmin". */
  salonId?: string;
  status?: INotification["status"];
  scheduledFor?: Date | string | null;
}

/** Resolves the recipient list for a target. Throws when the target is invalid. */
export async function resolveRecipients(
  input: Pick<CreateNotificationInput, "target" | "recipientIds" | "salonId">
): Promise<string[]> {
  switch (input.target) {
    case "all": {
      const [customers, salons] = await Promise.all([
        Customer.find().select("_id").lean<{ _id: { toString(): string } }[]>(),
        Salon.find().select("userId").lean(),
      ]);
      return [
        ...customers.map((c) => c._id.toString()),
        ...salons.map((s) => s.userId).filter(Boolean),
      ];
    }
    case "salons": {
      const salons = await Salon.find().select("userId").lean();
      return salons.map((s) => s.userId).filter(Boolean);
    }
    case "customers": {
      const customers = await Customer.find().select("_id").lean<{ _id: { toString(): string } }[]>();
      return customers.map((c) => c._id.toString());
    }
    case "specific": {
      if (!Array.isArray(input.recipientIds) || input.recipientIds.length === 0) {
        throw new Error("recipientIds are required for target 'specific'");
      }
      return input.recipientIds.map(String);
    }
    case "salonAdmin": {
      if (!input.salonId) throw new Error("salonId is required for target 'salonAdmin'");
      const salon = await Salon.findById(input.salonId).select("userId").lean();
      if (!salon?.userId) throw new Error("No admin associated with this salon");
      return [salon.userId];
    }
    default:
      throw new Error("Invalid notification target");
  }
}

/** Saves a notification and, when `status === "sent"`, pushes it to connected SSE clients. */
export async function createNotification(input: CreateNotificationInput) {
  const recipients = await resolveRecipients(input);
  const status = input.status ?? "draft";

  const notification = await Notification.create({
    title: input.title,
    content: input.content,
    type: input.type,
    target: input.target,
    recipientIds: recipients,
    status,
    scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
    sentAt: status === "sent" ? new Date() : null,
    read: false,
  });

  if (status === "sent") {
    const payload = {
      _id: notification._id,
      title: notification.title,
      content: notification.content,
      type: notification.type,
      createdAt: notification.createdAt,
      read: notification.read,
    };
    await Promise.all(recipients.map((id) => emitNotification(id, payload)));
  }

  return notification;
}
