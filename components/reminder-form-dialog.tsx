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
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-picker";
import { createReminder, updateReminder } from "@/actions/reminders";
import { Plus, Send, Phone, MessageSquare, Calendar, Globe, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Reminder } from "@/lib/schema";

// Draft storage key
const DRAFT_STORAGE_KEY = "reminder-form-draft";

interface DraftData {
    phoneNumber: string;
    message: string;
    scheduledAt: string | null;
    timezone: string;
}

function saveDraft(draft: DraftData) {
    if (typeof window !== "undefined") {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
}

function loadDraft(): DraftData | null {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return null;
            }
        }
    }
    return null;
}

function clearDraft() {
    if (typeof window !== "undefined") {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
}

interface ReminderFormDialogProps {
    pendingCount: number;
    maxPending: number;
}

export function ReminderFormDialog({ pendingCount, maxPending }: ReminderFormDialogProps) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const isAtLimit = pendingCount >= maxPending;

    const handleClose = () => {
        setOpen(false);
    };

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isAtLimit} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Buat Pengingat
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[500px]"
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Buat Pengingat Baru
                        </DialogTitle>
                        <DialogDescription>
                            Jadwalkan pesan WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm onSuccess={handleClose} onCancel={handleClose} />
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
                    <ReminderForm onSuccess={handleClose} onCancel={handleClose} />
                </div>
                <DrawerFooter className="pt-2">
                    <Button variant="outline" onClick={handleClose}>Tutup</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// Edit Dialog Component
interface EditReminderDialogProps {
    reminder: Reminder & { timezone?: string };
    children: React.ReactNode;
}

export function EditReminderDialog({ reminder, children }: EditReminderDialogProps) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();

    // Konversi waktu dari WIB ke timezone user untuk edit
    const timezoneOffsets: Record<string, number> = {
        "WIB": 0,
        "WITA": 1,
        "WIT": 2,
    };
    const tz = reminder.timezone || "WIB";
    const offset = timezoneOffsets[tz] || 0;
    const displayTime = new Date(reminder.scheduledAt.getTime() + offset * 60 * 60 * 1000);

    const handleClose = () => {
        setOpen(false);
    };

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent
                    className="sm:max-w-[500px]"
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-primary" />
                            Edit Pengingat
                        </DialogTitle>
                        <DialogDescription>
                            Ubah detail pengingat Anda.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm
                        onSuccess={handleClose}
                        onCancel={handleClose}
                        editMode
                        initialData={{
                            id: reminder.id,
                            phoneNumber: reminder.phoneNumber,
                            message: reminder.message,
                            scheduledAt: displayTime,
                            timezone: tz,
                        }}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-primary" />
                        Edit Pengingat
                    </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 overflow-y-auto max-h-[60vh]">
                    <ReminderForm
                        onSuccess={handleClose}
                        onCancel={handleClose}
                        editMode
                        initialData={{
                            id: reminder.id,
                            phoneNumber: reminder.phoneNumber,
                            message: reminder.message,
                            scheduledAt: displayTime,
                            timezone: tz,
                        }}
                    />
                </div>
                <DrawerFooter className="pt-2">
                    <Button variant="outline" onClick={handleClose}>Tutup</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

interface ReminderFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    editMode?: boolean;
    initialData?: {
        id: number;
        phoneNumber: string;
        message: string;
        scheduledAt: Date;
        timezone: string;
    };
}

function ReminderForm({ onSuccess, onCancel, editMode = false, initialData }: ReminderFormProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [phoneNumber, setPhoneNumber] = React.useState(initialData?.phoneNumber || "");
    const [message, setMessage] = React.useState(initialData?.message || "");
    const [scheduledAt, setScheduledAt] = React.useState<Date | undefined>(initialData?.scheduledAt);
    const [timezone, setTimezone] = React.useState(initialData?.timezone || "WIB");
    const [draftLoaded, setDraftLoaded] = React.useState(false);

    // Load draft on mount (only for create mode)
    React.useEffect(() => {
        if (!editMode && !draftLoaded) {
            const draft = loadDraft();
            if (draft) {
                setPhoneNumber(draft.phoneNumber || "");
                setMessage(draft.message || "");
                setTimezone(draft.timezone || "WIB");
                if (draft.scheduledAt) {
                    setScheduledAt(new Date(draft.scheduledAt));
                }
            }
            setDraftLoaded(true);
        }
    }, [editMode, draftLoaded]);

    // Auto-save draft (only for create mode)
    React.useEffect(() => {
        if (!editMode && draftLoaded) {
            const draft: DraftData = {
                phoneNumber,
                message,
                scheduledAt: scheduledAt?.toISOString() || null,
                timezone,
            };
            saveDraft(draft);
        }
    }, [phoneNumber, message, scheduledAt, timezone, editMode, draftLoaded]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.set("phoneNumber", phoneNumber);
            formData.set("message", message);
            if (scheduledAt) {
                formData.set("scheduledAt", scheduledAt.toISOString());
            }
            formData.set("timezone", timezone);

            if (editMode && initialData?.id) {
                await updateReminder(initialData.id, formData);
                toast.success("Pengingat berhasil diperbarui!");
            } else {
                await createReminder(formData);
                toast.success("Pengingat berhasil dibuat!");
                clearDraft();
            }

            // Reset form
            setPhoneNumber("");
            setMessage("");
            setScheduledAt(undefined);
            setTimezone("WIB");
            onSuccess();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan pengingat");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Don't clear draft on cancel for create mode
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Phone Number */}
            <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Nomor WhatsApp
                </Label>
                <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Masukan nomor WhatsApp"
                    required
                    className="h-12"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
            </div>

            {/* Message */}
            <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Pesan
                </Label>
                <Textarea
                    id="message"
                    placeholder="Tulis pesan pengingat Anda..."
                    required
                    rows={4}
                    className="resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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

            {/* Timezone */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Zona Waktu
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Pilih zona waktu" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="WIB">WIB - Waktu Indonesia Barat (UTC+7)</SelectItem>
                        <SelectItem value="WITA">WITA - Waktu Indonesia Tengah (UTC+8)</SelectItem>
                        <SelectItem value="WIT">WIT - Waktu Indonesia Timur (UTC+9)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 h-12"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || !scheduledAt}
                    className="flex-1 gap-2 h-12"
                >
                    {isLoading ? (
                        <>Menyimpan...</>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            {editMode ? "Simpan Perubahan" : "Jadwalkan"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
