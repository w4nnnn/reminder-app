"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldOff, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
    role: string | null;
    emailVerified: boolean;
    createdAt: Date;
    reminderCount: number;
}

interface UsersTableProps {
    users: User[];
    currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    async function handleRoleChange(userId: string, newRole: "user" | "admin") {
        setLoadingId(userId);
        try {
            await updateUserRole(userId, newRole);
            toast.success(`Role berhasil diubah menjadi ${newRole}`);
        } catch (error: any) {
            toast.error(error.message || "Gagal mengubah role");
        } finally {
            setLoadingId(null);
        }
    }

    async function handleDelete(userId: string) {
        setLoadingId(userId);
        try {
            await deleteUser(userId);
            toast.success("User berhasil dihapus");
        } catch (error: any) {
            toast.error(error.message || "Gagal menghapus user");
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Reminder</TableHead>
                        <TableHead>Bergabung</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const isCurrentUser = user.id === currentUserId;
                        const isLoading = loadingId === user.id;
                        const isAdmin = user.role === "admin";

                        return (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.name}
                                    {isCurrentUser && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            Anda
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={isAdmin ? "default" : "secondary"}>
                                        {isAdmin ? "Admin" : "User"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    {user.reminderCount}
                                </TableCell>
                                <TableCell>
                                    {user.createdAt.toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Toggle Role Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isCurrentUser || isLoading}
                                            onClick={() =>
                                                handleRoleChange(
                                                    user.id,
                                                    isAdmin ? "user" : "admin"
                                                )
                                            }
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isAdmin ? (
                                                <>
                                                    <ShieldOff className="h-4 w-4 mr-1" />
                                                    Demote
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4 mr-1" />
                                                    Promote
                                                </>
                                            )}
                                        </Button>

                                        {/* Delete Button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={isCurrentUser || isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Hapus User?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Anda akan menghapus <strong>{user.name}</strong> ({user.email}).
                                                        Semua reminder milik user ini juga akan dihapus.
                                                        Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(user.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Hapus
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
