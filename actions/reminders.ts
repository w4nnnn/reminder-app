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

    if (!phoneNumber || !message || !scheduledAtString) {
        throw new Error("Missing required fields");
    }

    const scheduledAt = new Date(scheduledAtString);

    await db.insert(reminders).values({
        userId: session.user.id,
        phoneNumber,
        message,
        scheduledAt,
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



