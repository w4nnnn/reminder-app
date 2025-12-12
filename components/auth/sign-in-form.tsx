"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            console.log("Sign in result:", result);

            if (result.error) {
                console.error("Sign in error:", result.error);
                setError(result.error.message || "Email atau password salah");
                setIsLoading(false);
                return;
            }

            // Check if we have data (successful sign in)
            if (result.data) {
                toast.success("Berhasil masuk!");
                // Use hard navigation to ensure cookies are read
                window.location.href = "/app";
                // Don't set isLoading to false here, let the page redirect
                return;
            }

            // If no error and no data, something unexpected happened
            setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
            setIsLoading(false);
        } catch (err) {
            console.error("Sign in exception:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <Bell className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">WA Reminder</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Masuk ke Akun Anda</h1>
                    <p className="text-muted-foreground mt-2">
                        Masukkan email dan password untuk melanjutkan
                    </p>
                </div>

                {/* Form */}
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="h-11"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Masuk
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Belum punya akun? </span>
                        <Link href="/sign-up" className="text-primary hover:underline font-medium">
                            Daftar sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
