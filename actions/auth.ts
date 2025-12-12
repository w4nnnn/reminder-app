"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function signOutAction() {
    const cookieStore = await cookies();

    // Call Better Auth signOut
    try {
        await auth.api.signOut({
            headers: await headers(),
        });
    } catch {
        // Ignore errors
    }

    // Clear the session cookie manually to ensure it's removed
    // We need to delete all possible variations of the cookie name

    // Normal delete
    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("__Secure-better-auth.session_token");

    // Force expire with correct attributes for Secure cookies
    cookieStore.set("__Secure-better-auth.session_token", "", {
        maxAge: 0,
        path: "/",
        secure: true,
        sameSite: "lax"
    });

    cookieStore.set("better-auth.session_token", "", {
        maxAge: 0,
        path: "/"
    });

    redirect("/");
}
