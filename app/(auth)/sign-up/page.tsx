import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
    title: "Daftar Akun Baru",
    description: "Buat akun WA Reminder gratis untuk mulai menjadwalkan pengingat WhatsApp otomatis.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function SignUpPage() {
    return <SignUpForm />;
}
