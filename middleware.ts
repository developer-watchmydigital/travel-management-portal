import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isSessionValid = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // 1. If visiting /admin/login while already authenticated, redirect directly to /admin
  if (pathname === "/admin/login") {
    if (isSessionValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow login API route through without session
  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // 3. Protect all other /admin and /api/admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isSessionValid) {
      // API requests get 401 Unauthorized
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or expired admin session." },
          { status: 401 }
        );
      }

      // Page requests get 307 Redirect to /admin/login
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
