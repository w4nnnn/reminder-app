import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, User } from "lucide-react";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-background">
            {/* App Navbar */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/app" className="flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">WA Reminder</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{session.user.email}</span>
                        </div>
                        <form action={signOutAction}>
                            <Button variant="ghost" size="sm" type="submit">
                                <LogOut className="h-4 w-4" />
                                Keluar
                            </Button>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>
        </div>
    );
}

