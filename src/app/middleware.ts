import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow access to login and static assets
  if (
    pathname === "/salon/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const sessionEmail = getSession("salon_registration_email");
  console.log(`Middleware: Checking path ${pathname} with session email:`, sessionEmail);

  // If accessing registration routes
  if (pathname.startsWith("/salon/register")) {
    if (sessionEmail) {
      try {
        const response = await fetch(`${req.nextUrl.origin}/api/salon/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sessionEmail }),
        });
        const data = await response.json();
        console.log(`Middleware: Progress check for ${sessionEmail}:`, data);

        if (data.paymentStatus === "completed" && data.isActive) {
          console.log(`Middleware: Redirecting ${sessionEmail} to /salon/login`);
          return NextResponse.redirect(
            new URL(`/salon/login?email=${encodeURIComponent(sessionEmail)}`, req.url)
          );
        }

        if (data.nextStep && data.nextStep !== pathname) {
          console.log(`Middleware: Redirecting ${sessionEmail} to ${data.nextStep}`);
          return NextResponse.redirect(
            new URL(`${data.nextStep}?email=${encodeURIComponent(sessionEmail)}`, req.url)
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
  matcher: ["/salon/register/:path*"],
};