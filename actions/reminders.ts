"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { reminders } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { and, count, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_PENDING_REMINDERS = 10;

async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session;
}

export async function createReminder(formData: FormData) {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    // Check pending reminders limit
    const pendingCount = await db
        .select({ count: count() })
        .from(reminders)
        .where(
            and(
                eq(reminders.userId, session.user.id),
                eq(reminders.status, "pending")
            )
        );

    if (pendingCount[0].count >= MAX_PENDING_REMINDERS) {
        throw new Error(`Anda sudah mencapai batas maksimal ${MAX_PENDING_REMINDERS} pengingat yang menunggu. Hapus beberapa pengingat terlebih dahulu.`);
    }

    const phoneNumber = formData.get("phoneNumber") as string;
    const message = formData.get("message") as string;
    const scheduledAtString = formData.get("scheduledAt") as string;
    const timezone = (formData.get("timezone") as string) || "WIB";

    if (!phoneNumber || !message || !scheduledAtString) {
        throw new Error("Missing required fields");
    }

    const scheduledAt = new Date(scheduledAtString);

    // Konversi waktu ke WIB untuk penyimpanan
    // WIB = UTC+7, WITA = UTC+8, WIT = UTC+9
    // Jika user memilih WITA/WIT, kurangi jamnya agar tersimpan dalam WIB
    const timezoneOffsets: Record<string, number> = {
        "WIB": 0,    // sama dengan server
        "WITA": -1,  // WITA 1 jam lebih awal dari WIB
        "WIT": -2,   // WIT 2 jam lebih awal dari WIB
    };

    const offset = timezoneOffsets[timezone] || 0;
    const scheduledAtWIB = new Date(scheduledAt.getTime() + offset * 60 * 60 * 1000);

    await db.insert(reminders).values({
        userId: session.user.id,
        phoneNumber,
        message,
        scheduledAt: scheduledAtWIB,
        timezone: timezone as "WIB" | "WITA" | "WIT",
        status: "pending",
    });

    revalidatePath("/app");
}

export async function getReminders() {
    const session = await getSession();

    if (!session) {
        return [];
    }

    return await db
        .select()
        .from(reminders)
        .where(eq(reminders.userId, session.user.id))
        .orderBy(desc(reminders.createdAt));
}

export async function getPendingCount() {
    const session = await getSession();

    if (!session) {
        return { count: 0, max: MAX_PENDING_REMINDERS };
    }

    const result = await db
        .select({ count: count() })
        .from(reminders)
        .where(
            and(
                eq(reminders.userId, session.user.id),
                eq(reminders.status, "pending")
            )
        );

    return {
        count: result[0].count,
        max: MAX_PENDING_REMINDERS
    };
}

export async function deleteReminder(id: number) {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    await db
        .delete(reminders)
        .where(and(eq(reminders.id, id), eq(reminders.userId, session.user.id)));

    revalidatePath("/app");
}

export async function updateReminder(id: number, formData: FormData) {
    const session = await getSession();

    if (!session) {
        redirect("/sign-in");
    }

    // Verify the reminder belongs to the user and is still pending
    const existing = await db
        .select()
        .from(reminders)
        .where(
            and(
                eq(reminders.id, id),
                eq(reminders.userId, session.user.id),
                eq(reminders.status, "pending")
            )
        );

    if (existing.length === 0) {
        throw new Error("Pengingat tidak ditemukan atau sudah tidak dapat diedit.");
    }

    const phoneNumber = formData.get("phoneNumber") as string;
    const message = formData.get("message") as string;
    const scheduledAtString = formData.get("scheduledAt") as string;
    const timezone = (formData.get("timezone") as string) || "WIB";

    if (!phoneNumber || !message || !scheduledAtString) {
        throw new Error("Missing required fields");
    }

    const scheduledAt = new Date(scheduledAtString);

    // Konversi waktu ke WIB untuk penyimpanan
    const timezoneOffsets: Record<string, number> = {
        "WIB": 0,
        "WITA": -1,
        "WIT": -2,
    };

    const offset = timezoneOffsets[timezone] || 0;
    const scheduledAtWIB = new Date(scheduledAt.getTime() + offset * 60 * 60 * 1000);

    await db
        .update(reminders)
        .set({
            phoneNumber,
            message,
            scheduledAt: scheduledAtWIB,
            timezone: timezone as "WIB" | "WITA" | "WIT",
        })
        .where(eq(reminders.id, id));

    revalidatePath("/app");
}
