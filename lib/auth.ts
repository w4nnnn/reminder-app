import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db";
import * as schema from "./schema";

export const auth = betterAuth({
    database: drizzleAdapter(getDb(), {
        provider: "sqlite",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const resendApiKey = process.env.RESEND_API_KEY;
            const emailFrom = process.env.EMAIL_FROM;

            if (!resendApiKey || !emailFrom) {
                console.error("Missing RESEND_API_KEY or EMAIL_FROM environment variables");
                throw new Error("Email configuration missing");
            }

            const { Resend } = await import("resend");
            const resend = new Resend(resendApiKey);

            await resend.emails.send({
                from: emailFrom,
                to: user.email,
                subject: "Verifikasi Email - WA Reminder",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Verifikasi Email Anda</h2>
                        <p>Halo ${user.name},</p>
                        <p>Terima kasih telah mendaftar di WA Reminder. Klik tombol di bawah untuk memverifikasi email Anda:</p>
                        <a href="${url}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                            Verifikasi Email
                        </a>
                        <p>Atau salin link berikut ke browser Anda:</p>
                        <p style="word-break: break-all; color: #666;">${url}</p>
                        <p>Link ini akan kadaluarsa dalam 24 jam.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="color: #999; font-size: 12px;">Jika Anda tidak mendaftar di WA Reminder, abaikan email ini.</p>
                    </div>
                `,
            });
        },
    },
});
