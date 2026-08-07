import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const accessToken = request.cookies.get("activationToken")?.value
  const { pathname } = request.nextUrl

  // Crawler-facing files: must stay reachable without auth or Google sees a
  // login redirect instead of robots.txt / sitemap.xml.
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return NextResponse.next()
  }

  // Public routes
  if(pathname === "/" || pathname.startsWith("/user/privacy") || pathname.startsWith("/user/terms") || pathname.startsWith("/customer")){
    return NextResponse.next()
  }

  // Auth pages
  if (
    pathname.startsWith("/user/login") ||
    pathname.startsWith("/user/register")
  ) {
    // If already logged in, redirect to home
    if (token) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Verification page
  if (pathname.startsWith("/user/verify")) {
    // Only allow users who just signed up (with accessToken)
    if (!accessToken) {
      return NextResponse.redirect(new URL("/user/login", request.url))
    }

    // If already verified, redirect to home
    if (token) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // Protect all other routes (sign-up wall)
  if (!token) {
    return NextResponse.redirect(new URL("/user/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",                  
    // Crawler + static files must never hit the auth wall
    "/((?!api|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)).*)",
    "/user/login",
    "/user/register",
    "/user/verify",
    "/user/privacy",
    "/user/terms",
    "/customer/:path*"
  ],
}
