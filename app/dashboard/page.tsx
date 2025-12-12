"use client";

import { useState, useEffect } from "react";
import { createReminder, deleteReminder, getReminders, toggleReminderStatus } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, LogOut } from "lucide-react";

type Reminder = {
    id: number;
    title: string;
    description: string | null;
    dueDate: Date | null;
    completed: boolean;
};

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    dueDate: z.string().optional(), // We'll handle date as string inputs for simplicity
});

export default function DashboardPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { data: session } = authClient.useSession();

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        const data = await getReminders();
        setReminders(data);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createReminder({
            title: values.title,
            description: values.description,
            dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
        });
        setOpen(false);
        form.reset();
        loadReminders();
    };

    const handleToggle = async (id: number) => {
        // Optimistic update
        setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
        await toggleReminderStatus(id);
        loadReminders();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        setReminders(reminders.filter(r => r.id !== id));
        await deleteReminder(id);
    };

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/");
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex gap-4 items-center">
                    <span>{session?.user?.name}</span>
                    <Button variant="outline" size="icon" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Reminders</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Reminder
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Reminder</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Buy groceries" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Milk, Eggs, Bread..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Create</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {reminders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No reminders yet. Click 'Add Reminder' to create one.</p>
                ) : (
                    reminders.map((reminder) => (
                        <Card key={reminder.id} className={reminder.completed ? "opacity-60 bg-muted" : ""}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Checkbox
                                    checked={reminder.completed}
                                    onCheckedChange={() => handleToggle(reminder.id)}
                                />
                                <div className="flex-1">
                                    <h3 className={`font-medium ${reminder.completed ? "line-through" : ""}`}>{reminder.title}</h3>
                                    {reminder.description && <p className="text-sm text-muted-foreground">{reminder.description}</p>}
                                    {reminder.dueDate && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(reminder.dueDate).toLocaleString()}</p>}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
