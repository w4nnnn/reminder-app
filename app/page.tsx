import { getReminders, deleteReminder } from "@/actions/reminders";
import { ReminderForm } from "@/components/reminder-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const reminders = await getReminders();

  return (
    <main className="container mx-auto py-10 max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">WhatsApp Reminders</h1>
        <p className="text-muted-foreground">
          Schedule WhatsApp messages via Baileys 7 worker.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Reminder</CardTitle>
          <CardDescription>Add a new scheduled message.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReminderForm />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Reminders</h2>
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {reminder.phoneNumber}
                </CardTitle>
                <div className="flex gap-2 items-center">
                  <Badge variant={reminder.status === 'sent' ? 'default' : reminder.status === 'failed' ? 'destructive' : 'secondary'}>
                    {reminder.status}
                  </Badge>
                  <form action={async () => {
                    "use server"
                    await deleteReminder(reminder.id)
                  }}>
                    <Button variant="ghost" size="sm" type="submit">Delete</Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {reminder.scheduledAt.toLocaleString()}
                </p>
                <p className="">{reminder.message}</p>
              </CardContent>
            </Card>
          ))}
          {reminders.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No reminders found.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
