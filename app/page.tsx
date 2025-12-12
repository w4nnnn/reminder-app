"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Clock, Zap, Shield, Calendar, Phone, Edit3, Send, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-x-hidden">
            {/* Navbar */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">WA Reminder</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/sign-in">
                            <Button variant="ghost">Masuk</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Daftar Gratis</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 lg:py-32">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium animate-in fade-in zoom-in-50 duration-500 delay-100">
                        <Zap className="h-4 w-4" />
                        Pengingat WhatsApp Otomatis
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        Jangan Lupa Lagi dengan{" "}
                        <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            WA Reminder
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        Cukup masukkan nomor WhatsApp, tulis pesan, dan pilih waktu.
                        Kami akan mengirimkan pengingat tepat waktu untuk Anda.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                        <Link href="/sign-up">
                            <Button size="lg" className="gap-2 px-8 hover:scale-105 transition-transform">
                                <MessageSquare className="h-5 w-5" />
                                Mulai Sekarang
                            </Button>
                        </Link>
                        <Link href="#cara-kerja">
                            <Button size="lg" variant="outline" className="px-8 hover:scale-105 transition-transform">
                                Lihat Cara Kerja
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Demo Card */}
                <div className="max-w-md mx-auto mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <div className="bg-card border rounded-2xl p-6 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-shadow duration-500">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Phone className="h-5 w-5 text-primary" />
                                <span className="text-muted-foreground">08123456789</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span className="text-muted-foreground">Besok, 09:00 WIB</span>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <Edit3 className="h-5 w-5 text-primary mt-0.5" />
                                <span className="text-muted-foreground">Jangan lupa meeting jam 10!</span>
                            </div>
                            <Button className="w-full gap-2">
                                <Send className="h-4 w-4" />
                                Jadwalkan Pengingat
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-4 py-20">
                <AnimatedSection>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Kenapa WA Reminder?</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Solusi sederhana untuk pengingat WhatsApp yang efektif
                        </p>
                    </div>
                </AnimatedSection>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <AnimatedSection delay={100}>
                        <FeatureCard
                            icon={<Clock className="h-8 w-8" />}
                            title="Jadwalkan Kapan Saja"
                            description="Pilih tanggal dan waktu yang tepat untuk setiap pengingat. Bisa menit, jam, hari, atau minggu ke depan."
                        />
                    </AnimatedSection>
                    <AnimatedSection delay={200}>
                        <FeatureCard
                            icon={<Phone className="h-8 w-8" />}
                            title="Ke Nomor Manapun"
                            description="Kirim pengingat ke nomor WhatsApp aktif manapun. Cukup masukkan nomor dengan format yang benar."
                        />
                    </AnimatedSection>
                    <AnimatedSection delay={300}>
                        <FeatureCard
                            icon={<Shield className="h-8 w-8" />}
                            title="Aman & Terpercaya"
                            description="Data Anda aman dan terenkripsi. Kami tidak menyimpan data sensitif apapun."
                        />
                    </AnimatedSection>
                </div>
            </section>

            {/* How it Works */}
            <section id="cara-kerja" className="bg-muted/30 py-20">
                <div className="container mx-auto px-4">
                    <AnimatedSection>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja</h2>
                            <p className="text-muted-foreground text-lg">
                                Hanya 3 langkah sederhana
                            </p>
                        </div>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <AnimatedSection delay={100}>
                            <StepCard
                                number="1"
                                icon={<Phone className="h-6 w-6" />}
                                title="Masukkan Nomor"
                                description="Ketik nomor WhatsApp tujuan yang ingin Anda ingatkan."
                            />
                        </AnimatedSection>
                        <AnimatedSection delay={200}>
                            <StepCard
                                number="2"
                                icon={<Edit3 className="h-6 w-6" />}
                                title="Tulis Pesan"
                                description="Buat pesan pengingat yang ingin Anda kirimkan."
                            />
                        </AnimatedSection>
                        <AnimatedSection delay={300}>
                            <StepCard
                                number="3"
                                icon={<CheckCircle className="h-6 w-6" />}
                                title="Pilih Waktu"
                                description="Tentukan kapan pengingat harus dikirim, dan selesai!"
                            />
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20">
                <AnimatedSection>
                    <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center max-w-4xl mx-auto hover:scale-[1.02] transition-transform duration-500">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Siap untuk Tidak Lupa Lagi?
                        </h2>
                        <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                            Daftar gratis sekarang dan buat pengingat pertama Anda dalam hitungan detik.
                        </p>
                        <Link href="/sign-up">
                            <Button size="lg" variant="secondary" className="px-8 hover:scale-105 transition-transform">
                                Daftar Gratis Sekarang
                            </Button>
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 animate-in fade-in duration-500">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">WA Reminder</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} WA Reminder. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-4");
                            entry.target.classList.remove("opacity-0", "translate-y-8");
                        }, delay);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    return (
        <div ref={ref} className="opacity-0 translate-y-8 duration-700">
            {children}
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-card border rounded-xl p-6 hover:shadow-lg hover:scale-105 hover:border-primary/50 transition-all duration-300">
            <div className="text-primary mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="text-center group">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-medium opacity-70">Step</span>
                    <span className="text-xl font-bold -mt-1">{number}</span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-primary">{icon}</span>
                <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
