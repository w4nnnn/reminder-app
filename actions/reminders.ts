"use server";

import { db } from "@/lib/db";
import { reminders } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createReminder(formData: FormData) {
    const phoneNumber = formData.get("phoneNumber") as string;
    const message = formData.get("message") as string;
    const scheduledAtString = formData.get("scheduledAt") as string;

    if (!phoneNumber || !message || !scheduledAtString) {
        throw new Error("Missing required fields");
    }

    const scheduledAt = new Date(scheduledAtString);

    await db.insert(reminders).values({
        phoneNumber,
        message,
        scheduledAt,
        status: "pending",
    });

    revalidatePath("/reminders");
}

export async function getReminders() {
    return await db.select().from(reminders).orderBy(desc(reminders.createdAt));
}

export async function deleteReminder(id: number) {
    await db.delete(reminders).where(eq(reminders.id, id));
    revalidatePath("/reminders");
}
