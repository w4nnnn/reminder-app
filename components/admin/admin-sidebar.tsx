"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Manajemen User",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Semua Reminder",
        href: "/admin/reminders",
        icon: MessageSquare,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card min-h-screen p-4 space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-lg font-bold">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Kelola aplikasi</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Back to App */}
            <div className="pt-4 border-t">
                <Link
                    href="/app"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Aplikasi
                </Link>
            </div>
        </aside>
    );
}
