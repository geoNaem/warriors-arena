import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // 1. Protect Admin Routes
  if (isAdminRoute && !nextUrl.pathname.startsWith("/admin/login") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  // 2. CSRF / Source Validation for API POST
  if (req.method === 'POST' && isApiRoute) {
    const source = req.headers.get('x-warriors-source');
    const origin = req.headers.get('origin');
    const isInternal = origin?.includes(process.env.NEXT_PUBLIC_APP_URL || 'localhost');
    
    if (!source && !isInternal && !isLoggedIn) {
       return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
