import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  SUPER_ADMIN_COOKIE,
  SUPER_ADMIN_SESSION_HOURS,
  signSuperAdminToken,
} from "@/lib/auth/superadmin-token";
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
} from "@/lib/auth/superadmin-credentials";

// Constant-time string compare that doesn't leak length via an early return.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// POST /api/superadmin/login
// Verifies the hardcoded super-admin credentials on the server and issues an
// httpOnly session cookie that src/middleware.ts checks for /Superadmin/dashboard.
export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const emailOk = safeEqual(email.toLowerCase(), SUPER_ADMIN_EMAIL.toLowerCase());
  const passwordOk = safeEqual(password, SUPER_ADMIN_PASSWORD);

  if (!emailOk || !passwordOk) {
    return NextResponse.json(
      { error: "Invalid super admin credentials" },
      { status: 401 }
    );
  }

  const token = await signSuperAdminToken(SUPER_ADMIN_EMAIL);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SUPER_ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SUPER_ADMIN_SESSION_HOURS * 60 * 60,
  });
  return res;
}
