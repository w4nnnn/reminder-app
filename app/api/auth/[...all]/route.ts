import { auth } from "@/lib/auth"; // Adjust import path
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
