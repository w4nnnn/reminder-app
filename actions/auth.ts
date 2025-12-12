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
    cookieStore.delete("better-auth.session_token");

    redirect("/");
}
