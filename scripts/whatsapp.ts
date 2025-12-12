import * as dotenv from "dotenv";
dotenv.config();

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} from "baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { db } from "../lib/db";
import { reminders } from "../lib/schema";
import { eq, lte, and } from "drizzle-orm";

// Filter out verbose logs from dependencies
const patterns = ["Closing session", "SessionEntry"];
function isNoise(args: any[]) {
    return args.some(arg => {
        if (typeof arg === 'string') return patterns.some(p => arg.includes(p));
        // Check for specific object structure common in the noisy logs
        if (typeof arg === 'object' && arg !== null) {
            return 'registrationId' in arg && 'currentRatchet' in arg && '_chains' in arg;
        }
        return false;
    });
}

const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

const monkeyPatch = (original: any) => (...args: any[]) => {
    if (isNoise(args)) return;
    original.apply(console, args);
};

console.log = monkeyPatch(originalLog);
console.info = monkeyPatch(originalInfo);
console.warn = monkeyPatch(originalWarn);
console.error = monkeyPatch(originalError);

const AUTH_FOLDER = "auth_info_baileys";

async function connectToWhatsApp(mode: "login" | "worker") {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }) as any,
        auth: state,
        browser: ["ReminderApp", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && mode === "login") {
            console.log("Scan the QR code below to login:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;

            console.log(
                "connection closed due to ",
                lastDisconnect?.error,
                ", reconnecting ",
                shouldReconnect
            );

            if (shouldReconnect) {
                connectToWhatsApp(mode);
            } else {
                console.log("Connection closed. You are logged out.");
                if (mode === "worker") process.exit(1);
            }
        } else if (connection === "open") {
            console.log("opened connection");
            if (mode === "login") {
                console.log("Login successful! You can now run the worker.");
                process.exit(0);
            }
        }
    });

    return sock;
}

async function startWorker() {
    console.log("Worker started...");
    const sock = await connectToWhatsApp("worker");

    // Wait for connection to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        const now = new Date();
        const pendingReminders = await db
            .select()
            .from(reminders)
            .where(
                and(
                    eq(reminders.status, "pending"),
                    lte(reminders.scheduledAt, now)
                )
            );

        for (const reminder of pendingReminders) {
            console.log(`Sending reminder to ${reminder.phoneNumber}: ${reminder.message}`);

            try {
                const jid = reminder.phoneNumber.includes("@s.whatsapp.net")
                    ? reminder.phoneNumber
                    : `${reminder.phoneNumber}@s.whatsapp.net`;

                await sock.sendMessage(jid, { text: reminder.message });

                await db
                    .update(reminders)
                    .set({ status: "sent" })
                    .where(eq(reminders.id, reminder.id));

                console.log("pesan terkirim");
            } catch (error) {
                console.error(`Failed to send reminder ${reminder.id}:`, error);
                await db
                    .update(reminders)
                    .set({ status: "failed" })
                    .where(eq(reminders.id, reminder.id));
            }
        }

        if (pendingReminders.length === 0) {
            console.log("No pending reminders.");
        }
    } catch (error) {
        console.error("Error in worker:", error);
    }

    console.log("Worker finished. Exiting...");
    process.exit(0);
}

async function main() {
    const arg = process.argv[2];

    if (arg === "login") {
        await connectToWhatsApp("login");
    } else if (arg === "logout") {
        if (fs.existsSync(AUTH_FOLDER)) {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            console.log("Logged out. Session cleared.");
        } else {
            console.log("No session found.");
        }
    } else {
        // Default: Worker mode
        if (!fs.existsSync(AUTH_FOLDER)) {
            console.error("No session found. Please run 'npx tsx scripts/whatsapp.ts login' first.");
            process.exit(1);
        }
        await startWorker();
    }
}

main();
