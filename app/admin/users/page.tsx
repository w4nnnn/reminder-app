import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getAllUsers } from "@/actions/admin";
import { UsersTable } from "@/components/admin/users-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";

export default async function AdminUsersPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const users = await getAllUsers();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen User</h1>
                    <p className="text-muted-foreground">
                        Kelola user dan hak akses
                    </p>
                </div>
                <CreateUserDialog />
            </div>

            {/* Users Table */}
            <UsersTable users={users} currentUserId={session!.user.id} />
        </div>
    );
}
