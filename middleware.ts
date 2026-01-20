import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected Routes Pattern
const PROTECTED_ROUTES = [
    '/decision',
    '/market',
    '/signals',
    '/context',
    '/system',
    '/watchlist'
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check for Auth Cookie
    const authToken = request.cookies.get('auth_token')?.value;
    const isAuthenticated = authToken === 'valid';

    // 2. Handle Login Page Access (Redirect to App if already logged in)
    if (pathname === '/login' || pathname === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/decision', request.url));
        }
        // Allow access to login if not authenticated
        // Note: '/' root redirects to login if not auth, or decision if auth
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Handle Protected Routes
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// Config to match routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - logo.png (assets)
         * - manifest.json (PWA)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox|icons).*)',
    ],
};
