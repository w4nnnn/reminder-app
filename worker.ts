import { connectToWhatsApp, getSocket } from "./lib/whatsapp";
import { db } from "./lib/db";
import { settings } from "./lib/schema";
import { eq } from "drizzle-orm";
// No need to import setInterval loop as it's defined in lib/whatsapp (conditionally, or we refactor)

// Actually, I need to refactor lib/whatsapp.ts first to NOT auto-run. 
// But let's assume I will.

async function main() {
    console.log("Starting WhatsApp Worker...");
    const sock = await connectToWhatsApp();

    // The scheduler is already inside lib/whatsapp.ts, but we need to ensure it runs.
    // If lib/whatsapp.ts is refactored effectively, this is the entry point.

    // Keep alive? Socket keeps it alive.
    // However, if we need to listen for commands from DB (like logout), we can add a loop here.

    process.on('SIGINT', async () => {
        console.log("Stopping worker...");
        if (sock) {
            sock.end(new Error("Worker stopping"));
        }
        process.exit(0);
    });
}

main();
