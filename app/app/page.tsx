import Link from "next/link";
import { getReminders, deleteReminder, getPendingCount } from "@/actions/reminders";
import { ReminderFormDialog } from "@/components/reminder-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reminder } from "@/lib/schema";
import { Phone, Calendar, MessageSquare, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";

type FilterType = "all" | "pending" | "sent" | "failed";

interface PageProps {
    searchParams: Promise<{ filter?: string }>;
}

export default async function AppPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const filter = (params.filter as FilterType) || "all";

    const reminders = await getReminders();
    const { count: pendingCount, max: maxPending } = await getPendingCount();

    // Filter reminders based on selected filter
    const filteredReminders = filter === "all"
        ? reminders
        : reminders.filter((r: Reminder) => r.status === filter);

    // Count stats
    const stats = {
        total: reminders.length,
        pending: reminders.filter((r: Reminder) => r.status === "pending").length,
        sent: reminders.filter((r: Reminder) => r.status === "sent").length,
        failed: reminders.filter((r: Reminder) => r.status === "failed").length,
    };

    return (
        <main className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Pengingat Saya</h1>
                    <p className="text-muted-foreground">
                        Kelola jadwal pesan WhatsApp Anda
                    </p>
                </div>
                <ReminderFormDialog pendingCount={pendingCount} maxPending={maxPending} />
            </div>

            {/* Stats Cards - Clickable Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total"
                    value={stats.total}
                    icon={<MessageSquare className="h-4 w-4" />}
                    filterKey="all"
                    isActive={filter === "all"}
                />
                <StatCard
                    label="Menunggu"
                    value={stats.pending}
                    icon={<Clock className="h-4 w-4" />}
                    variant="warning"
                    filterKey="pending"
                    isActive={filter === "pending"}
                />
                <StatCard
                    label="Terkirim"
                    value={stats.sent}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    variant="success"
                    filterKey="sent"
                    isActive={filter === "sent"}
                />
                <StatCard
                    label="Gagal"
                    value={stats.failed}
                    icon={<XCircle className="h-4 w-4" />}
                    variant="danger"
                    filterKey="failed"
                    isActive={filter === "failed"}
                />
            </div>

            {/* View for filter "all" - show pending and history separately */}
            {filter === "all" && (
                <>
                    {/* Pending Reminders */}
                    {reminders.filter((r: Reminder) => r.status === "pending").length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Menunggu Dikirim
                            </h2>
                            <div className="grid gap-3">
                                {reminders
                                    .filter((r: Reminder) => r.status === "pending")
                                    .map((reminder: Reminder) => (
                                        <ReminderCard key={reminder.id} reminder={reminder} />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* History (sent + failed) */}
                    {reminders.filter((r: Reminder) => r.status !== "pending").length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                                Riwayat
                            </h2>
                            <div className="grid gap-3">
                                {reminders
                                    .filter((r: Reminder) => r.status !== "pending")
                                    .map((reminder: Reminder) => (
                                        <ReminderCard key={reminder.id} reminder={reminder} />
                                    ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* View for specific filters (pending, sent, failed) */}
            {filter !== "all" && filteredReminders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {filter === "pending" && <Clock className="h-5 w-5 text-amber-500" />}
                        {filter === "sent" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {filter === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
                        {filter === "pending" && "Menunggu Dikirim"}
                        {filter === "sent" && "Terkirim"}
                        {filter === "failed" && "Gagal"}
                    </h2>
                    <div className="grid gap-3">
                        {filteredReminders.map((reminder: Reminder) => (
                            <ReminderCard key={reminder.id} reminder={reminder} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State for specific filters */}
            {filter !== "all" && filteredReminders.length === 0 && reminders.length > 0 && (
                <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        {filter === "pending" && <Clock className="h-8 w-8 text-muted-foreground" />}
                        {filter === "sent" && <CheckCircle2 className="h-8 w-8 text-muted-foreground" />}
                        {filter === "failed" && <XCircle className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                        Tidak ada pengingat {filter === "pending" ? "menunggu" : filter === "sent" ? "terkirim" : "gagal"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        <Link href="/app" className="text-primary hover:underline">
                            Lihat semua pengingat
                        </Link>
                    </p>
                </div>
            )}

            {/* Empty State - No reminders at all */}
            {reminders.length === 0 && (
                <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Belum ada pengingat</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Buat pengingat pertama Anda untuk mulai menjadwalkan pesan WhatsApp.
                    </p>
                    <ReminderFormDialog pendingCount={pendingCount} maxPending={maxPending} />
                </div>
            )}
        </main>
    );
}

function StatCard({
    label,
    value,
    icon,
    variant = "default",
    filterKey,
    isActive,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    variant?: "default" | "warning" | "success" | "danger";
    filterKey: string;
    isActive: boolean;
}) {
    const variantStyles = {
        default: "bg-card border hover:border-primary/50",
        warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 hover:border-amber-400",
        success: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900 hover:border-green-400",
        danger: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900 hover:border-red-400",
    };

    const activeStyles = {
        default: "ring-2 ring-primary ring-offset-2",
        warning: "ring-2 ring-amber-500 ring-offset-2",
        success: "ring-2 ring-green-500 ring-offset-2",
        danger: "ring-2 ring-red-500 ring-offset-2",
    };

    const iconStyles = {
        default: "text-muted-foreground",
        warning: "text-amber-600 dark:text-amber-400",
        success: "text-green-600 dark:text-green-400",
        danger: "text-red-600 dark:text-red-400",
    };

    const href = filterKey === "all" ? "/app" : `/app?filter=${filterKey}`;

    return (
        <Link href={href}>
            <div
                className={`rounded-xl p-4 cursor-pointer transition-all duration-200 ${variantStyles[variant]} ${isActive ? activeStyles[variant] : ""}`}
            >
                <div className={`flex items-center gap-2 mb-1 ${iconStyles[variant]}`}>
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </Link>
    );
}

function ReminderCard({ reminder }: { reminder: Reminder }) {
    const statusConfig = {
        pending: {
            badge: "Menunggu",
            variant: "secondary" as const,
            icon: <Clock className="h-3 w-3" />,
        },
        sent: {
            badge: "Terkirim",
            variant: "default" as const,
            icon: <CheckCircle2 className="h-3 w-3" />,
        },
        failed: {
            badge: "Gagal",
            variant: "destructive" as const,
            icon: <XCircle className="h-3 w-3" />,
        },
    };

    const status = statusConfig[reminder.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Phone Number */}
                    <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold">{reminder.phoneNumber}</span>
                        <Badge variant={status.variant} className="gap-1 text-xs">
                            {status.icon}
                            {status.badge}
                        </Badge>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            {reminder.scheduledAt.toLocaleString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>

                    {/* Message */}
                    <p className="text-sm line-clamp-2">{reminder.message}</p>
                </div>

                {/* Delete Button */}
                <form
                    action={async () => {
                        "use server";
                        await deleteReminder(reminder.id);
                    }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        type="submit"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
