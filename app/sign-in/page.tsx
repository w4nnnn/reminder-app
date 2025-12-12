"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();



        if (isSignUp) {
            const { error } = await authClient.signUp.email({
                email,
                password,
                name: email.split("@")[0]
            });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Account created! Please check your email for verification.");
                setIsSignUp(false);
            }
        } else {
            const { error } = await authClient.signIn.email({
                email,
                password
            });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Logged in successfully");
                router.push("/dashboard");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-sm">
                <div className="text-center">
                    <h2 className="text-3xl font-bold">{isSignUp ? "Create Account" : "Sign In"}</h2>
                    <p className="text-gray-500">
                        {isSignUp ? "Enter your email to get started" : "Welcome back"}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </Button>
                </form>
                <div className="text-center">
                    <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
