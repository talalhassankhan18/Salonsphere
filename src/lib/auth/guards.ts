// Server-side auth guards for API routes and server actions.
//
// Usage in a route handler:
//   const denied = await requireSuperAdmin();
//   if (denied) return denied;
//
//   const salon = await requireSalonAdmin();
//   if (salon instanceof NextResponse) return salon;
//   // salon.salonId is now the caller's own salon — never trust one from the body.

import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SUPER_ADMIN_COOKIE, verifySuperAdminToken } from "./superadmin-token";

const unauthorized = (message = "Unauthorized") =>
  NextResponse.json({ error: message }, { status: 401 });

const forbidden = (message = "Forbidden") =>
  NextResponse.json({ error: message }, { status: 403 });

/** True if the request carries a valid super-admin cookie. */
export async function isSuperAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPER_ADMIN_COOKIE)?.value;
  return (await verifySuperAdminToken(token)) !== null;
}

/** Returns a 401 response when the caller is not a logged-in super-admin, otherwise null. */
export async function requireSuperAdmin(): Promise<NextResponse | null> {
  return (await isSuperAdminRequest())
    ? null
    : unauthorized("Super-admin login required");
}

export interface SalonAdminIdentity {
  salonId: string;
  email: string;
  userId: string;
}

/** Returns the caller's salon identity, or a 401/403 response. */
export async function requireSalonAdmin(): Promise<
  SalonAdminIdentity | NextResponse
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized("Salon login required");
  if (session.user.role !== "salon_admin" || !session.user.salonId) {
    return forbidden("Salon admin role required");
  }
  return {
    salonId: session.user.salonId,
    email: session.user.email ?? "",
    userId: session.user.id ?? "",
  };
}

export interface CustomerIdentity {
  id: string;
  email: string;
}

/** Returns the caller's customer identity, or a 401/403 response. */
export async function requireCustomer(): Promise<
  CustomerIdentity | NextResponse
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return unauthorized("Login required");
  if (session.user.role !== "customer" || !session.user.id) {
    return forbidden("Customer role required");
  }
  return { id: session.user.id, email: session.user.email ?? "" };
}

/**
 * Allows a super-admin, or a customer acting on their own record.
 * Returns null when allowed, otherwise a 401/403 response.
 */
export async function requireSuperAdminOrSelf(
  customerId: string
): Promise<NextResponse | null> {
  if (await isSuperAdminRequest()) return null;
  const me = await requireCustomer();
  if (me instanceof NextResponse) return me;
  return me.id === customerId ? null : forbidden();
}

/**
 * Allows a super-admin (any salon) or a salon admin restricted to their own salon.
 * Returns the effective salonId filter (null = unrestricted) or a 401/403 response.
 */
export async function requireSuperAdminOrOwnSalon(
  requestedSalonId: string | null
): Promise<{ salonId: string | null } | NextResponse> {
  if (await isSuperAdminRequest()) return { salonId: requestedSalonId };
  const salon = await requireSalonAdmin();
  if (salon instanceof NextResponse) return salon;
  if (requestedSalonId && requestedSalonId !== salon.salonId) {
    return forbidden("You can only access your own salon's data");
  }
  return { salonId: salon.salonId };
}
