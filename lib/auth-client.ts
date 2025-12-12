import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // Change in production
});

export const { useSession, signIn, signOut, signUp } = authClient;
