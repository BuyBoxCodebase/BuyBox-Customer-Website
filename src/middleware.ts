import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const accessToken = request.cookies.get("accessToken")?.value
  // console.log(token)

  // const token =
  //   token &&
    // (await verifyAuth(token).catch((err) => {
    //   // console.log(err)
    // }))

  // Auth pages (login and register)
  if (request.nextUrl.pathname.startsWith("/user/login") || request.nextUrl.pathname.startsWith("/user/register")) {
    // If user is authenticated (has valid token), redirect to home page
    if (token) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    // Otherwise, allow access
    return NextResponse.next()
  }

  // Verification page
  if (request.nextUrl.pathname.startsWith("/user/verify")) {
    // If no token, redirect to login
    if (accessToken) {
      return NextResponse.redirect(new URL("/user/login", request.url))
    }
    
    // If user is already verified, redirect to home page
    if (typeof token !== "string" && token) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    
    // Allow unverified users with token to access verification page
    return NextResponse.next()
  }

  // Protected routes - require verified user
  if (!token) {
    // No token at all - redirect to login
    return NextResponse.redirect(new URL("/user/login", request.url))
  }
  
  if (typeof token !== "string" && !token) {
    // Has token but not verified - redirect to verification
    return NextResponse.redirect(new URL("/user/verify", request.url))
  }

  // User is authenticated and verified, allow access to protected routes
  return NextResponse.next()
}

export const config = {
  matcher: ["/user/login", "/user/register", "/user/verify", "/protected/:path*"],
}