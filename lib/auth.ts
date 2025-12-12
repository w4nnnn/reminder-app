import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { getDb } from "./db";
import * as schema from "./schema";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : [],
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
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
        crossSubDomainCookies: {
            enabled: false,
        },
    },
    plugins: [
        emailOTP({
            sendVerificationOnSignUp: true,
            async sendVerificationOTP({ email, otp, type }) {
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
                    to: email,
                    subject: "Kode Verifikasi - WA Reminder",
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; max-width: 480px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <img src="${process.env.BETTER_AUTH_URL}/icon.png" alt="WA Reminder Logo" style="width: 48px; height: 48px; margin-bottom: 16px;">
                                <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Kode Verifikasi</h1>
                            </div>
                            
                            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                                <p style="color: #4b5563; font-size: 15px; margin: 0 0 24px 0; line-height: 1.5;">Gunakan kode berikut untuk menyelesaikan proses verifikasi Anda:</p>
                                
                                <div style="margin: 0 0 24px 0;">
                                    <span style="font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 8px; background-color: #ffffff; padding: 12px 24px; border-radius: 8px; border: 1px solid #dbeafe;">
                                        ${otp}
                                    </span>
                                </div>
                                
                                <p style="color: #6b7280; font-size: 13px; margin: 0;">Kode ini berlaku selama 15 menit.</p>
                            </div>
                            
                            <div style="margin-top: 32px; text-align: center;">
                                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                                    Jika Anda tidak merasa meminta kode ini, mohon abaikan email ini.<br>
                                    &copy; ${new Date().getFullYear()} WA Reminder. All rights reserved.
                                </p>
                            </div>
                        </div>
                    `,
                });
            },
        }),
    ],
});
