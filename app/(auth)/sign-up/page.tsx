"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, MailCheck } from "lucide-react";

type Step = "form" | "verification-sent";

export default function SignUpPage() {
    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError("Password minimal 8 karakter");
            return;
        }

        setIsLoading(true);

        try {
            const result = await signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || "Gagal mendaftar. Silakan coba lagi.");
            } else {
                setStep("verification-sent");
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
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
                    {step === "form" && (
                        <>
                            <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
                            <p className="text-muted-foreground mt-2">
                                Daftar untuk mulai menjadwalkan pengingat WhatsApp
                            </p>
                        </>
                    )}
                    {step === "verification-sent" && (
                        <>
                            <h1 className="text-2xl font-bold">Verifikasi Email</h1>
                            <p className="text-muted-foreground mt-2">
                                Kami telah mengirim link verifikasi ke email Anda
                            </p>
                        </>
                    )}
                </div>

                {/* Registration Form */}
                {step === "form" && (
                    <div className="bg-card border rounded-2xl p-6 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>

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
                                    placeholder="Minimal 8 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                    Konfirmasi Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Ulangi password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-11"
                                />
                                {password && confirmPassword && (
                                    <div className="flex items-center gap-1 text-xs">
                                        {password === confirmPassword ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                <span className="text-green-600">Password cocok</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-3 w-3 text-destructive" />
                                                <span className="text-destructive">Password tidak cocok</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={isLoading || !name || !email || !password || !confirmPassword || password !== confirmPassword}
                            >
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Daftar
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Sudah punya akun? </span>
                            <Link href="/sign-in" className="text-primary hover:underline font-medium">
                                Masuk di sini
                            </Link>
                        </div>
                    </div>
                )}

                {/* Verification Sent */}
                {step === "verification-sent" && (
                    <div className="bg-card border rounded-2xl p-8 shadow-lg text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MailCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Cek Email Anda</h2>
                        <p className="text-muted-foreground mb-6">
                            Kami telah mengirim link verifikasi ke <span className="font-medium text-foreground">{email}</span>.
                            Klik link tersebut untuk mengaktifkan akun Anda.
                        </p>
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Tidak menerima email? Periksa folder spam Anda.
                            </p>
                            <Link href="/sign-in">
                                <Button variant="outline" className="w-full">
                                    Kembali ke Halaman Masuk
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
