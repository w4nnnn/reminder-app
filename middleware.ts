import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for session cookie (Better Auth uses "better-auth.session_token" by default)
    const sessionCookie = request.cookies.get("better-auth.session_token");
    const hasSession = !!sessionCookie?.value;

    // Protected routes - redirect to sign-in if not authenticated
    if (pathname.startsWith("/app")) {
        if (!hasSession) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    // Auth routes - redirect to app if already authenticated
    if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
        if (hasSession) {
            return NextResponse.redirect(new URL("/app", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/app/:path*", "/sign-in", "/sign-up"],
};


