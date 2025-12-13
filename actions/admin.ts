"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { reminders, user } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { count, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// ============ Auth Helpers ============

async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session;
}

export async function isAdmin() {
    const session = await getSession();
    if (!session) return false;

    const result = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    return result[0]?.role === "admin";
}

async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        redirect("/app");
    }
}

// ============ Dashboard Stats ============

export async function getDashboardStats() {
    await requireAdmin();

    const [totalUsers] = await db.select({ count: count() }).from(user);
    const [totalReminders] = await db.select({ count: count() }).from(reminders);
    const [pendingReminders] = await db
        .select({ count: count() })
        .from(reminders)
        .where(eq(reminders.status, "pending"));
    const [sentReminders] = await db
        .select({ count: count() })
        .from(reminders)
        .where(eq(reminders.status, "sent"));
    const [failedReminders] = await db
        .select({ count: count() })
        .from(reminders)
        .where(eq(reminders.status, "failed"));

    return {
        totalUsers: totalUsers.count,
        totalReminders: totalReminders.count,
        pendingReminders: pendingReminders.count,
        sentReminders: sentReminders.count,
        failedReminders: failedReminders.count,
    };
}

// ============ User Management ============

export async function getAllUsers() {
    await requireAdmin();

    const users = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            reminderCount: sql<number>`(SELECT COUNT(*) FROM reminders WHERE reminders.user_id = ${user.id})`,
        })
        .from(user)
        .orderBy(desc(user.createdAt));

    return users;
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
    await requireAdmin();

    const session = await getSession();

    // Prevent self-demotion
    if (session?.user.id === userId && role === "user") {
        throw new Error("Anda tidak bisa menurunkan role diri sendiri");
    }

    await db
        .update(user)
        .set({ role, updatedAt: new Date() })
        .where(eq(user.id, userId));

    revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
    await requireAdmin();

    const session = await getSession();

    // Prevent self-deletion
    if (session?.user.id === userId) {
        throw new Error("Anda tidak bisa menghapus akun sendiri");
    }

    // Delete user (reminders will be cascade deleted due to FK constraint)
    await db.delete(user).where(eq(user.id, userId));

    revalidatePath("/admin/users");
}

export async function createUser(formData: FormData) {
    await requireAdmin();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "user" | "admin";

    if (!name || !email || !password) {
        throw new Error("Semua field harus diisi");
    }

    // Check if email already exists
    const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        throw new Error("Email sudah terdaftar");
    }

    // Hash password using better-auth's built-in method
    const { hashPassword } = await import("better-auth/crypto");
    const hashedPassword = await hashPassword(password);

    const userId = nanoid();
    const now = new Date();

    // Create user
    await db.insert(user).values({
        id: userId,
        name,
        email,
        emailVerified: true, // Admin-created users are auto-verified
        role: role || "user",
        createdAt: now,
        updatedAt: now,
    });

    // Create account with credential provider
    const { account } = await import("@/lib/schema");
    await db.insert(account).values({
        id: nanoid(),
        accountId: userId,
        providerId: "credential",
        userId: userId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
    });

    revalidatePath("/admin/users");
}

// ============ Reminder Management ============

export async function getAllReminders() {
    await requireAdmin();

    const result = await db
        .select({
            id: reminders.id,
            phoneNumber: reminders.phoneNumber,
            message: reminders.message,
            scheduledAt: reminders.scheduledAt,
            status: reminders.status,
            createdAt: reminders.createdAt,
            userId: reminders.userId,
            userName: user.name,
            userEmail: user.email,
        })
        .from(reminders)
        .leftJoin(user, eq(reminders.userId, user.id))
        .orderBy(desc(reminders.createdAt));

    return result;
}

export async function deleteReminderAdmin(id: number) {
    await requireAdmin();

    await db.delete(reminders).where(eq(reminders.id, id));

    revalidatePath("/admin/reminders");
}
