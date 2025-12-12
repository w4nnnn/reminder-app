"use client";

import { useState, useActionState } from "react";
import { createReminder } from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Phone, Calendar, MessageSquare, Loader2, AlertCircle } from "lucide-react";

interface ReminderFormDialogProps {
    onSuccess?: () => void;
    pendingCount?: number;
    maxPending?: number;
}

/**
 * Format nomor telepon ke format internasional Indonesia (62xxx)
 * Contoh input yang didukung:
 * - +62 897-3914-602 -> 628973914602
 * - 0897-3914-602 -> 628973914602
 * - 897-3914-602 -> 628973914602
 * - +628973914602 -> 628973914602
 * - 08973914602 -> 628973914602
 */
function formatPhoneNumber(input: string): string {
    // Hapus semua karakter non-angka
    let cleaned = input.replace(/\D/g, "");

    // Jika dimulai dengan 62, sudah benar
    if (cleaned.startsWith("62")) {
        return cleaned;
    }

    // Jika dimulai dengan 0, ganti dengan 62
    if (cleaned.startsWith("0")) {
        return "62" + cleaned.slice(1);
    }

    // Jika dimulai dengan 8 (tanpa 0 atau 62), tambahkan 62
    if (cleaned.startsWith("8")) {
        return "62" + cleaned;
    }

    // Jika tidak cocok pattern, kembalikan apa adanya dengan 62 di depan
    return "62" + cleaned;
}

export function ReminderFormDialog({ onSuccess, pendingCount, maxPending }: ReminderFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [error, setError] = useState<string | null>(null);

    const isLimitReached = pendingCount !== undefined && maxPending !== undefined && pendingCount >= maxPending;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Hanya terima angka
        const input = e.target.value.replace(/\D/g, "");
        setPhoneDisplay(input);

        // Format saat user selesai mengetik (ada angka)
        if (input.length > 0) {
            setPhoneNumber(formatPhoneNumber(input));
        } else {
            setPhoneNumber("");
        }
    };

    const handlePhoneBlur = () => {
        // Format ulang dan tampilkan nomor yang sudah diformat saat blur
        if (phoneNumber) {
            setPhoneDisplay(phoneNumber);
        }
    };

    const [, action, isPending] = useActionState(async (_prev: unknown, formData: FormData) => {
        setError(null);

        if (date) {
            formData.set("scheduledAt", date.toISOString());
        }
        // Set nomor yang sudah diformat
        formData.set("phoneNumber", phoneNumber);

        try {
            await createReminder(formData);
            setDate(undefined);
            setPhoneNumber("");
            setPhoneDisplay("");
            setOpen(false);
            onSuccess?.();
            return { success: true };
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            return { success: false };
        }
    }, null);

    return (
        <Dialog open={open} onOpenChange={(value) => { setOpen(value); setError(null); }}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    disabled={isLimitReached}
                >
                    <Plus className="h-5 w-5" />
                    {isLimitReached ? `Limit Tercapai` : "Buat Reminder Baru"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Buat Reminder Baru
                    </DialogTitle>
                    <DialogDescription>
                        Jadwalkan pesan WhatsApp untuk dikirim pada waktu tertentu.
                    </DialogDescription>
                </DialogHeader>
                <form action={action} className="space-y-5 mt-4">
                    {error && (
                        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Nomor WhatsApp
                        </Label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumberDisplay"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Masukan Nomor WhatsApp"
                            value={phoneDisplay}
                            onChange={handlePhoneChange}
                            onBlur={handlePhoneBlur}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Jadwal Kirim
                        </Label>
                        <DateTimePicker date={date} setDate={setDate} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            Pesan
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Tulis pesan pengingat Anda di sini..."
                            required
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending || !date || !phoneNumber} className="gap-2">
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isPending ? "Menyimpan..." : "Buat Reminder"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}

