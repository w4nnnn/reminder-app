import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const reminders = sqliteTable("reminders", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    phoneNumber: text("phone_number").notNull(),
    message: text("message").notNull(),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
    status: text("status", { enum: ["pending", "sent", "failed"] }).notNull().default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
