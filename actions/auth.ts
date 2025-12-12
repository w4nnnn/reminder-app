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
    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("__Secure-better-auth.session_token");
    cookieStore.delete("better-auth.session");
    // better-auth might use other prefixes/suffixes depending on config
    cookieStore.set("better-auth.session_token", "", { maxAge: 0 });
    cookieStore.set("__Secure-better-auth.session_token", "", { maxAge: 0 });

    redirect("/");
}
