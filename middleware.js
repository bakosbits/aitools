import { NextResponse } from "next/server";

const PROTECTED_ROUTE = "/admin";
const AUTH_COOKIE_NAME = "auth";
const SESSION_DURATION_SECONDS = 60 * 15;

export function middleware(request) {
  const isDevelopment = process.env.NODE_ENV === "development";

  const { pathname } = request.nextUrl;
  if (pathname.startsWith(PROTECTED_ROUTE)) {
    const requestIp =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0].trim();

    const allowedIps = (process.env.ALLOWED_HOSTS || "")
      .split(",")
      .filter(Boolean)
      .map((ip) => ip.trim());

    if (
      allowedIps.length > 0 &&
      !allowedIps.includes(requestIp) &&
      !isDevelopment
    ) {
      console.warn(
        `[Middleware] Denied access to ${pathname} for IP: ${requestIp}`,
      );
      return NextResponse.rewrite(new URL("/403", request.url));
    }

    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
    if (!authCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (authCookie) {
    const response = NextResponse.next();
    response.cookies.set(AUTH_COOKIE_NAME, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
