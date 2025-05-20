import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getSession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("Middleware: Processing request for", pathname);

  // Allow access to login, auth APIs, static assets, and other APIs
  if (
    pathname === "/salon/login" ||
    pathname === "/auth/signin" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Check for authenticated session
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token",
  });

  // Protect salon dashboard
  if (pathname.startsWith("/salon/dashboard")) {
    if (!token || token.role !== "salon_admin") {
      console.log(
        "Middleware: Unauthorized access to /salon/dashboard, redirecting to /salon/login"
      );
      return NextResponse.redirect(new URL("/salon/login", req.url));
    }
    return NextResponse.next();
  }

  // Protect checkout route
  if (pathname.startsWith("/checkout")) {
    if (!token || token.role !== "customer") {
      console.log(
        "Middleware: Unauthorized access to /checkout, redirecting to /auth/signin"
      );
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // Handle salon registration routes
  if (pathname.startsWith("/salon/register")) {
    const sessionEmail = getSession("salon_registration_email");
    console.log(
      `Middleware: Checking path ${pathname} with session email:`,
      sessionEmail
    );

    if (sessionEmail) {
      try {
        const response = await fetch(
          `${req.nextUrl.origin}/api/salon/progress`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sessionEmail }),
          }
        );
        const data = await response.json();
        console.log(`Middleware: Progress check for ${sessionEmail}:`, data);

        if (data.paymentStatus === "completed" && data.isActive) {
          console.log(
            `Middleware: Redirecting ${sessionEmail} to /salon/login`
          );
          return NextResponse.redirect(
            new URL(
              `/salon/login?email=${encodeURIComponent(sessionEmail)}`,
              req.url
            )
          );
        }

        if (data.nextStep && data.nextStep !== pathname) {
          console.log(
            `Middleware: Redirecting ${sessionEmail} to ${data.nextStep}`
          );
          return NextResponse.redirect(
            new URL(
              `${data.nextStep}?email=${encodeURIComponent(sessionEmail)}`,
              req.url
            )
          );
        }
      } catch (error) {
        console.error("Middleware: Progress check failed:", error);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/salon/register/:path*",
    "/salon/dashboard/:path*",
    "/checkout/:path*",
  ],
};
