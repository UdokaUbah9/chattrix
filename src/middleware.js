import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // If the user hits exactly /dashboard, send them to /dashboard/reels
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Only run on this specific path
};
