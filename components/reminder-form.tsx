"use client";

import { useActionState } from "react";
import { createReminder } from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-picker";
import { useState } from "react";

export function ReminderForm() {
    const [date, setDate] = useState<Date | undefined>(undefined);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, action, isPending] = useActionState(async (prev: any, formData: FormData) => {
        if (date) {
            formData.set("scheduledAt", date.toISOString());
        }
        await createReminder(formData);
        setDate(undefined);
        return { success: true };
    }, null);

    return (
        <form action={action} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Nomor HP (awali dengan 62)</Label>
                <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="628123456789"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>Jadwal Kirim</Label>
                <DateTimePicker date={date} setDate={setDate} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Halo dari masa depan!"
                    required
                />
            </div>
            <Button type="submit" disabled={isPending || !date}>
                {isPending ? "Menyimpan..." : "Buat Reminder"}
            </Button>
        </form>
    );
}
