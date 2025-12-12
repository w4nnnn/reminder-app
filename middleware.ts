import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
    // Middleware sementara dinonaktifkan karena belum ada auth setup
    // TODO: Implementasi auth jika diperlukan
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
