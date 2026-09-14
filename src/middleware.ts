// Next.js only loads middleware from `src/middleware.ts` (or the project root).
// It previously lived at `src/app/middleware.ts`, where it was silently ignored.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  SUPER_ADMIN_COOKIE,
  verifySuperAdminToken,
} from "@/lib/auth/superadmin-token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Super-admin area (custom signed cookie, see /api/superadmin/login) ---
  if (pathname.startsWith("/Superadmin/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get(SUPER_ADMIN_COOKIE)?.value;
    if (!(await verifySuperAdminToken(token))) {
      const loginUrl = new URL("/Superadmin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // --- NextAuth-protected areas ---
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (pathname.startsWith("/salon/dashboard")) {
    if (!session || session.role !== "salon_admin") {
      return NextResponse.redirect(new URL("/salon/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/checkout")) {
    if (!session || session.role !== "customer") {
      const signin = new URL("/auth/signin", req.url);
      signin.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signin);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Superadmin/dashboard/:path*",
    "/users/:path*",
    "/salon/dashboard/:path*",
    "/checkout/:path*",
  ],
};
