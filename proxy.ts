export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg (favicon files)
     * - login, register, forgot-password, verify-email (auth pages)
     * - api/auth (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|login|register|forgot-password|verify-email|api/auth).*)",
  ],
};
