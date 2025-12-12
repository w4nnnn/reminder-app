import {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    WASocket,
    proto,
    makeCacheableSignalKeyStore,
} from "baileys";
import { db } from "./db";
import { reminders, settings } from "./schema";
import { eq, lte, and } from "drizzle-orm";
import { Boom } from "@hapi/boom";
import pino from "pino";
import fs from "fs";

// Hack to suppress specific noisy logs from Baileys/Libsignal
const originalLog = console.log;
const originalInfo = console.info;
const originalError = console.error;

function shouldSuppress(args: any[]) {
    // Check first argument for the specific string
    if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('Closing session')) {
        return true;
    }
    return false;
}

console.log = function (...args) {
    if (shouldSuppress(args)) return;
    originalLog.apply(console, args);
};

console.info = function (...args) {
    if (shouldSuppress(args)) return;
    originalInfo.apply(console, args);
};

console.error = function (...args) {
    if (shouldSuppress(args)) return; // Sometimes error channel is used for warnings
    originalError.apply(console, args);
};

let sock: WASocket | undefined;
let qrCode: string | undefined;
let connectionStatus: string = "disconnected";

const AUTH_FOLDER = "auth_info_baileys";

export async function connectToWhatsApp() {
    if (!fs.existsSync(AUTH_FOLDER)) {
        fs.mkdirSync(AUTH_FOLDER);
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: "silent" }) as any,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCode = qr;
            connectionStatus = "scanning";
            await updateSettings("status", "scanning");
            await updateSettings("qr", qr);
        }

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;

            console.log("Connection closed due to ", lastDisconnect?.error, ", reconnecting ", shouldReconnect);
            connectionStatus = "disconnected";
            qrCode = undefined;

            await updateSettings("status", "disconnected");
            await updateSettings("qr", null);

            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === "open") {
            console.log("Opened connection");
            connectionStatus = "connected";
            qrCode = undefined;

            await updateSettings("status", "connected");
            await updateSettings("qr", null);
        }
    });

    return sock;
}

// Scheduler to check for due reminders
setInterval(async () => {
    if (connectionStatus !== "connected" || !sock) return;

    try {
        const now = new Date();
        const pendingReminders = await db.select().from(reminders).where(
            and(
                eq(reminders.status, "pending"),
                lte(reminders.scheduledAt, now)
            )
        );

        for (const reminder of pendingReminders) {
            console.log(`Sending reminder to ${reminder.phone}: ${reminder.message}`);

            // Format phone number (simple check, ideally use a library)
            let phone = reminder.phone.replace(/[^0-9]/g, "");
            if (!phone.endsWith("@s.whatsapp.net")) {
                phone = `${phone}@s.whatsapp.net`;
            }

            try {
                await sock.sendMessage(phone, { text: reminder.message });
                await db.update(reminders).set({ status: "sent" }).where(eq(reminders.id, reminder.id));
                console.log(`Reminder ${reminder.id} sent.`);
            } catch (err) {
                console.error(`Failed to send reminder ${reminder.id}:`, err);
                await db.update(reminders).set({ status: "failed" }).where(eq(reminders.id, reminder.id));
            }
        }
    } catch (error) {
        console.error("Scheduler error:", error);
    }
}, 30000); // Check every 30 seconds

export function getSocket() {
    return sock;
}

export function getStatus() {
    return { connectionStatus, qrCode };
}

// Helper to update settings in DB
async function updateSettings(key: string, value: any) {
    try {
        await db.insert(settings).values({ key, value: JSON.stringify(value) })
            .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value), updatedAt: new Date() } });
    } catch (e) {
        console.error("Failed to update settings:", e);
    }
}

// Initial connection - REMOVED for Worker separation
// connectToWhatsApp();
