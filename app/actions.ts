"use server";

import { db } from "@/lib/db";
import { reminder, user } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

export async function getReminders() {
    const session = await getSession();
    if (!session) return [];

    return await db.select().from(reminder)
        .where(eq(reminder.userId, session.user.id))
        .orderBy(desc(reminder.createdAt));
}

export async function createReminder(data: { title: string; description?: string; dueDate?: Date }) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await db.insert(reminder).values({
        ...data,
        userId: session.user.id,
    });
    revalidatePath("/dashboard");
}

export async function updateReminder(id: number, data: Partial<typeof reminder.$inferInsert>) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Ensure user owns the reminder
    const existing = await db.select().from(reminder).where(and(eq(reminder.id, id), eq(reminder.userId, session.user.id)));
    if (!existing.length) throw new Error("Not found or unauthorized");

    await db.update(reminder).set({
        ...data,
        updatedAt: new Date(),
    }).where(eq(reminder.id, id));
    revalidatePath("/dashboard");
}

export async function deleteReminder(id: number) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await db.delete(reminder).where(and(eq(reminder.id, id), eq(reminder.userId, session.user.id)));
    revalidatePath("/dashboard");
}

export async function toggleReminderStatus(id: number) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const existing = await db.select().from(reminder).where(and(eq(reminder.id, id), eq(reminder.userId, session.user.id)));
    if (!existing.length) throw new Error("Not found or unauthorized");

    await db.update(reminder).set({
        completed: !existing[0].completed,
        updatedAt: new Date(),
    }).where(eq(reminder.id, id));
    revalidatePath("/dashboard");
}
