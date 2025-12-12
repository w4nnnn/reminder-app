import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Better Auth cookie names (check both development and production names)
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token") ||
        request.cookies.get("better-auth.session");
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
