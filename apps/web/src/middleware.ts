import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip authentication for specific paths
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Redirect /login to /auth/login
  if (request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Check for the session cookie
  const session = request.cookies.get('session')?.value;

  if (!session && !request.nextUrl.pathname.startsWith('/auth')) {
    // No session cookie, redirect to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (session) {
    try {
      // For now, just check if the session cookie exists
      // We'll verify it properly in the page or API routes

      if (
        request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/auth/signout')
      ) {
        // User is logged in and trying to access auth pages, redirect to home
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If verification fails, redirect to login
      if (!request.nextUrl.pathname.startsWith('/auth')) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
