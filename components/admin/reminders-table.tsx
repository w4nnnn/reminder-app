"use client";

import { useState } from "react";
import { deleteReminderAdmin } from "@/actions/admin";
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
import { Trash2, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Reminder {
    id: number;
    phoneNumber: string;
    message: string;
    scheduledAt: Date;
    status: string;
    createdAt: Date;
    userId: string;
    userName: string | null;
    userEmail: string | null;
}

interface RemindersTableProps {
    reminders: Reminder[];
}

const statusConfig = {
    pending: {
        label: "Menunggu",
        variant: "secondary" as const,
        icon: Clock,
    },
    sent: {
        label: "Terkirim",
        variant: "default" as const,
        icon: CheckCircle2,
    },
    failed: {
        label: "Gagal",
        variant: "destructive" as const,
        icon: XCircle,
    },
};

export function RemindersTable({ reminders }: RemindersTableProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    async function handleDelete(id: number) {
        setLoadingId(id);
        try {
            await deleteReminderAdmin(id);
            toast.success("Reminder berhasil dihapus");
        } catch (error: any) {
            toast.error(error.message || "Gagal menghapus reminder");
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>No. HP</TableHead>
                        <TableHead className="max-w-[200px]">Pesan</TableHead>
                        <TableHead>Jadwal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reminders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                Belum ada reminder
                            </TableCell>
                        </TableRow>
                    ) : (
                        reminders.map((reminder) => {
                            const status = statusConfig[reminder.status as keyof typeof statusConfig] || statusConfig.pending;
                            const StatusIcon = status.icon;
                            const isLoading = loadingId === reminder.id;

                            return (
                                <TableRow key={reminder.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{reminder.userName || "-"}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {reminder.userEmail || "-"}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {reminder.phoneNumber}
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <p className="truncate" title={reminder.message}>
                                            {reminder.message}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        {reminder.scheduledAt.toLocaleString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant} className="gap-1">
                                            <StatusIcon className="h-3 w-3" />
                                            {status.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Hapus Reminder?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Anda akan menghapus reminder ke <strong>{reminder.phoneNumber}</strong>.
                                                        Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(reminder.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Hapus
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
