import { NextResponse } from "next/server";

export function proxy(request) {
  const authToken = request.cookies.get("slack-auth-token");
  const { pathname } = request.nextUrl;

  // If user is not authenticated and trying to access protected routes
  if (!authToken && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access login page
  if (authToken && pathname === "/login") {
    const homeUrl = new URL("/channel/1", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // If user is authenticated and trying to access root, redirect to default channel
  if (authToken && pathname === "/") {
    const homeUrl = new URL("/channel/1", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
