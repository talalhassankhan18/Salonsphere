import { NextRequest, NextResponse } from "next/server";
import { addClient, removeClient } from "@/lib/notifications";
import { requireNotificationIdentity } from "@/lib/auth/guards";

// GET /api/notifications/sse?userId=...
// Live stream of notifications addressed to `userId`. A caller may only
// subscribe to their own id (the super-admin may subscribe to any).
export async function GET(req: NextRequest) {
  const identity = await requireNotificationIdentity();
  if (identity instanceof NextResponse) return identity;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!identity.isSuperAdmin && !identity.recipientIds.includes(userId)) {
    return NextResponse.json(
      { error: "You can only subscribe to your own notifications" },
      { status: 403 }
    );
  }

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  addClient(userId, writer);

  await writer.write(
    encoder.encode(`data: ${JSON.stringify({ message: "SSE connection established" })}\n\n`)
  );

  req.signal.addEventListener("abort", () => {
    removeClient(userId, writer);
    writer.close().catch((err) => console.error("Error closing writer:", err));
  });

  return new NextResponse(stream.readable, { headers });
}
