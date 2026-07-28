import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Enforce HTTPS in production environments
  const proto = request.headers.get('x-forwarded-proto');
  if (process.env.NODE_ENV === 'production' && proto === 'http') {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    // 301 Permanent Redirect to HTTPS
    return NextResponse.redirect(httpsUrl.toString(), 301);
  }

  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Gating admin dashboard pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      // Redirect unauthenticated clients to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 3. Prevent redundant login page visits
  if (pathname === '/admin/login') {
    if (token) {
      // Redirect authenticated clients directly to dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Config to match all page paths, excluding APIs and static assets
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
