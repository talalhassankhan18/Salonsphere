import { NextResponse } from "next/server";
import { SUPER_ADMIN_COOKIE } from "@/lib/auth/superadmin-token";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SUPER_ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
