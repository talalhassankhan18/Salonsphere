// Edge-safe super-admin session token helpers (jose only — no next/headers,
// so this file can be imported from middleware as well as route handlers).

import { SignJWT, jwtVerify } from "jose";

export const SUPER_ADMIN_COOKIE = "superadmin_session";
export const SUPER_ADMIN_SESSION_HOURS = 8;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET (or NEXTAUTH_SECRET) must be set to sign super-admin sessions"
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SuperAdminTokenPayload {
  sub: string; // super-admin email
  role: "super_admin";
}

export async function signSuperAdminToken(email: string): Promise<string> {
  return new SignJWT({ role: "super_admin" } satisfies Omit<
    SuperAdminTokenPayload,
    "sub"
  >)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SUPER_ADMIN_SESSION_HOURS}h`)
    .sign(getSecretKey());
}

/** Returns the payload if the token is valid and carries the super_admin role, else null. */
export async function verifySuperAdminToken(
  token: string | undefined
): Promise<SuperAdminTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (payload.role !== "super_admin" || typeof payload.sub !== "string") {
      return null;
    }
    return { sub: payload.sub, role: "super_admin" };
  } catch {
    return null;
  }
}
