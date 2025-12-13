import { getDashboardStats, getAllUsers, getAllReminders } from "@/actions/admin";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { Users, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();
    const users = await getAllUsers();
    const reminders = await getAllReminders();

    // Get recent items
    const recentUsers = users.slice(0, 5);
    const recentReminders = reminders.slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard Admin</h1>
                <p className="text-muted-foreground">
                    Pantau aktivitas aplikasi WA Reminder
                </p>
            </div>

            {/* Stats */}
            <AdminStatsCards stats={stats} />

            {/* Recent Activity Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">User Terbaru</h2>
                        </div>
                        <Link
                            href="/admin/users"
                            className="text-sm text-primary hover:underline"
                        >
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Belum ada user
                            </p>
                        ) : (
                            recentUsers.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {u.createdAt.toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Reminders */}
                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Reminder Terbaru</h2>
                        </div>
                        <Link
                            href="/admin/reminders"
                            className="text-sm text-primary hover:underline"
                        >
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentReminders.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Belum ada reminder
                            </p>
                        ) : (
                            recentReminders.map((r) => (
                                <div
                                    key={r.id}
                                    className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{r.phoneNumber}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {r.userName} - {r.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {r.scheduledAt.toLocaleDateString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
