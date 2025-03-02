import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = new Set(["/salons", "/vendor"]);
const publicRoutes = new Set(["/login", "/register"]);

// Enable debugging via .env variable
const DEBUG = process.env.DEBUG_MIDDLEWARE === "true";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.has(path);
  const isPublicRoute = publicRoutes.has(path);

  // Retrieve session cookie
  const sessionCookie = req.cookies.get("session")?.value;

  let session = null;
  if (sessionCookie) {
    try {
      session = await decrypt(sessionCookie);
    } catch (error) {
      console.error("❌ Middleware Error: Failed to decrypt session", error);
    }
  }

  if (DEBUG) {
    console.log(`🛠 Middleware Debug - Path: ${path}`);
    console.log(`🛠 Middleware Debug - Session:`, session);
  }

  // Redirect unauthorized users from protected routes to login
  if (isProtectedRoute && !session?.userId) {
    if (DEBUG) console.log("🔒 Unauthorized! Redirecting to /login.");
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect logged-in users away from public routes to /salons
  if (isPublicRoute && session?.userId) {
    if (DEBUG) console.log("✅ Already authenticated! Redirecting to /salons.");
    return NextResponse.redirect(new URL("/salons", req.nextUrl));
  }

  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/login", "/register", "/salons", "/vendor"],
};
