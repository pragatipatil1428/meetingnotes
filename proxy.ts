import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Redirect signed-out users to the login page. The matcher below only runs the
// proxy on app pages (login, register and api/auth are excluded), so every
// request that reaches here requires an authenticated user.
export const proxy = auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg (favicon files)
     * - login, register (auth pages)
     * - api/auth (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|login|register|api/auth).*)",
  ],
};
