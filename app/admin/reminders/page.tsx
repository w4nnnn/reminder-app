import { getAllReminders } from "@/actions/admin";
import { RemindersTable } from "@/components/admin/reminders-table";

export default async function AdminRemindersPage() {
    const reminders = await getAllReminders();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Semua Reminder</h1>
                <p className="text-muted-foreground">
                    Monitor semua reminder dari seluruh user
                </p>
            </div>

            {/* Reminders Table */}
            <RemindersTable reminders={reminders} />
        </div>
    );
}
