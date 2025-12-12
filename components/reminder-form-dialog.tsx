"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-picker";
import { createReminder } from "@/actions/reminders";
import { Plus, Send, Phone, MessageSquare, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ReminderFormDialogProps {
    pendingCount: number;
    maxPending: number;
}

export function ReminderFormDialog({ pendingCount, maxPending }: ReminderFormDialogProps) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const isAtLimit = pendingCount >= maxPending;

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isAtLimit} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Buat Pengingat
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Buat Pengingat Baru
                        </DialogTitle>
                        <DialogDescription>
                            Jadwalkan pesan WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm onSuccess={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button disabled={isAtLimit} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Buat Pengingat
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Buat Pengingat Baru
                    </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 overflow-y-auto max-h-[60vh]">
                    <ReminderForm onSuccess={() => setOpen(false)} />
                </div>
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Batal</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

interface ReminderFormProps {
    onSuccess: () => void;
}

function ReminderForm({ onSuccess }: ReminderFormProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [scheduledAt, setScheduledAt] = React.useState<Date | undefined>(undefined);
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            if (scheduledAt) {
                formData.set("scheduledAt", scheduledAt.toISOString());
            }

            await createReminder(formData);
            toast.success("Pengingat berhasil dibuat!");
            formRef.current?.reset();
            setScheduledAt(undefined);
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal membuat pengingat");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Phone Number */}
            <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Nomor WhatsApp
                </Label>
                <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                    required
                    className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                    Gunakan format Indonesia (08... atau 628...)
                </p>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Pesan
                </Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Tulis pesan pengingat Anda..."
                    required
                    rows={4}
                    className="resize-none"
                />
            </div>

            {/* Schedule */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Jadwal Kirim
                </Label>
                <DateTimePicker
                    date={scheduledAt}
                    setDate={setScheduledAt}
                    placeholder="Pilih tanggal & waktu"
                    className="w-full h-12"
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isLoading || !scheduledAt}
                className="w-full gap-2 h-12"
            >
                {isLoading ? (
                    <>Sedang menyimpan...</>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        Jadwalkan Pengingat
                    </>
                )}
            </Button>
        </form>
    );
}
