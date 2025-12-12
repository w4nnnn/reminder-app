"use server";

import { db } from "@/lib/db";
import { reminders, NewReminder } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getReminders() {
    return await db.select().from(reminders).orderBy(desc(reminders.createdAt));
}

export async function createReminder(data: { phone: string; message: string; scheduledAt: Date }) {
    await db.insert(reminders).values({
        phone: data.phone,
        message: data.message,
        scheduledAt: data.scheduledAt,
        status: "pending",
    });
    revalidatePath("/");
    return { success: true };
}

export async function deleteReminder(id: number) {
    await db.delete(reminders).where(eq(reminders.id, id));
    revalidatePath("/");
    return { success: true };
}
