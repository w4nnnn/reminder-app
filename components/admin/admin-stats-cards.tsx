import { Users, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";

interface StatsCardsProps {
    stats: {
        totalUsers: number;
        totalReminders: number;
        pendingReminders: number;
        sentReminders: number;
        failedReminders: number;
    };
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Total User",
            value: stats.totalUsers,
            icon: Users,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/30",
        },
        {
            title: "Total Reminder",
            value: stats.totalReminders,
            icon: MessageSquare,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/30",
        },
        {
            title: "Menunggu",
            value: stats.pendingReminders,
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/30",
        },
        {
            title: "Terkirim",
            value: stats.sentReminders,
            icon: CheckCircle2,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-950/30",
        },
        {
            title: "Gagal",
            value: stats.failedReminders,
            icon: XCircle,
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-50 dark:bg-red-950/30",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`rounded-xl p-4 border ${card.bg}`}
                >
                    <div className={`flex items-center gap-2 mb-2 ${card.color}`}>
                        <card.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{card.title}</span>
                    </div>
                    <p className="text-2xl font-bold">{card.value}</p>
                </div>
            ))}
        </div>
    );
}
