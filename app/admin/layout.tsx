import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
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

    // Check if user is admin
    const result = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

    if (result[0]?.role !== "admin") {
        redirect("/app");
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-6 bg-background">
                {children}
            </main>
        </div>
    );
}
