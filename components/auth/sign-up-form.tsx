"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signUp, emailOtp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Bell, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type Step = "form" | "otp-verification";

export function SignUpForm() {
    const [step, setStep] = useState<Step>("form");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Cooldown timer effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            return;
        }

        if (password.length < 8) {
            setError("Password minimal 8 karakter");
            return;
        }

        setIsLoading(true);

        try {
            // Sign up user - OTP will be sent automatically by plugin
            const signUpResult = await signUp.email({
                name,
                email,
                password,
            });

            if (signUpResult.error) {
                setError(signUpResult.error.message || "Gagal mendaftar. Silakan coba lagi.");
                setIsLoading(false);
                return;
            }

            // OTP sent automatically, just show verification step
            toast.success("Kode OTP telah dikirim ke email Anda!");
            setCooldown(60); // 60 detik cooldown
            setStep("otp-verification");
            setIsLoading(false);
        } catch (err) {
            console.error("Sign up error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await emailOtp.verifyEmail({
                email,
                otp,
            });

            if (result.error) {
                setError(result.error.message || "Kode OTP salah atau kadaluarsa");
                setIsLoading(false);
                return;
            }

            // Verification success - auto login
            toast.success("Email berhasil diverifikasi! Sedang masuk...");

            // Sign in automatically
            const signInResult = await signIn.email({
                email,
                password,
                callbackURL: "/app",
            });

            if (signInResult.error) {
                setError("Verifikasi berhasil, tetapi gagal masuk otomatis. Silakan masuk manual.");
                setIsLoading(false);
                return;
            }

            // Use hard navigation to ensure cookie is read properly
            window.location.href = "/app";
        } catch (err) {
            console.error("OTP verification error:", err);
            setError("Terjadi kesalahan saat verifikasi.");
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (cooldown > 0) return;

        setError(null);
        setIsLoading(true);

        try {
            const result = await emailOtp.sendVerificationOtp({
                email,
                type: "email-verification",
            });

            if (result.error) {
                setError("Gagal mengirim ulang kode OTP");
            } else {
                toast.success("Kode OTP baru telah dikirim!");
                setCooldown(60); // 60 detik cooldown
            }
        } catch {
            setError("Terjadi kesalahan saat mengirim ulang OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
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
                    {step === "otp-verification" && (
                        <>
                            <h1 className="text-2xl font-bold">Verifikasi Email</h1>
                            <p className="text-muted-foreground mt-2">
                                Masukkan 6 digit kode yang dikirim ke{" "}
                                <span className="font-medium text-foreground">{email}</span>
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
                                    placeholder="Masukan Nama Lengkap Anda"
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
                                    placeholder="Masukan Email Anda"
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
                                disabled={
                                    isLoading ||
                                    !name ||
                                    !email ||
                                    !password ||
                                    !confirmPassword ||
                                    password !== confirmPassword
                                }
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

                {/* OTP Verification */}
                {step === "otp-verification" && (
                    <div className="bg-card border rounded-2xl p-8 shadow-lg">
                        <form onSubmit={handleVerifyOTP} className="flex flex-col items-center space-y-6">
                            {error && (
                                <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg w-full text-left">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex justify-center w-full">
                                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} disabled={isLoading}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={isLoading || otp.length < 6}>
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Verifikasi
                                {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                            </Button>

                            <div className="flex flex-col gap-2 w-full">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResendOTP}
                                    disabled={isLoading || cooldown > 0}
                                    className="text-muted-foreground"
                                >
                                    {cooldown > 0 ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Kirim Ulang ({cooldown}s)
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Kirim Ulang Kode
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStep("form")}
                                    disabled={isLoading}
                                    className="text-muted-foreground"
                                >
                                    Kembali / Ganti Email
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
