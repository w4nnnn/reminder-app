import * as dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { db } from "../lib/db";
import { reminders } from "../lib/schema";
import { eq, lte, and } from "drizzle-orm";

const SESSION_PATH = "./wa_session";
// Load templates
const TEMPLATE_PATH = path.join(__dirname, "whatsapp/formatMessage.json");

let templates: { text: string }[] = [];

try {
    const fileContent = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    templates = JSON.parse(fileContent);
} catch (error) {
    console.error("Failed to load message templates:", error);
    // Fallback template
    templates = [
        { text: "*🔔 PENGINGAT 🔔*\n\n{message}\n\n------------------------------------------------\n_Pesan otomatis dari Reminder App_" }
    ];
}

function getRandomMessage(message: string): string {
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.text.replace("{message}", message);
}

let client: Client;

async function initializeClient(): Promise<Client> {
    console.log("Initializing WhatsApp client...");

    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: SESSION_PATH,
        }),
        puppeteer: {
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu",
            ],
        },
    });

    client.on("qr", (qr) => {
        console.log("Scan QR Code below to login:");
        qrcode.generate(qr, { small: true });
    });

    client.on("authenticated", () => {
        console.log("Authenticated successfully!");
    });

    client.on("auth_failure", (msg) => {
        console.error("Authentication failed:", msg);
    });

    client.on("ready", () => {
        console.log("WhatsApp client is ready!");
    });

    client.on("disconnected", (reason) => {
        console.log("Client disconnected:", reason);
        // Reconnect after 5 seconds
        setTimeout(() => {
            console.log("Attempting to reconnect...");
            client.initialize();
        }, 5000);
    });

    await client.initialize();
    return client;
}

async function checkAndSendReminders() {
    console.log(`[${new Date().toLocaleTimeString()}] Checking for reminders...`);
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

        if (pendingReminders.length === 0) {
            return;
        }

        console.log(`Found ${pendingReminders.length} pending reminders`);

        for (const reminder of pendingReminders) {
            console.log(`Sending reminder to ${reminder.phoneNumber}: ${reminder.message}`);

            try {
                // Format phone number to WhatsApp ID
                let phoneNumber = reminder.phoneNumber.replace(/\D/g, "");
                if (phoneNumber.startsWith("0")) {
                    phoneNumber = "62" + phoneNumber.slice(1);
                }
                const chatId = phoneNumber + "@c.us";

                // Simulate typing
                const chat = await client.getChatById(chatId);
                await chat.sendStateTyping();

                // Typing delay (1-3 seconds) to make it look real
                const typingDelay = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);
                await new Promise((resolve) => setTimeout(resolve, typingDelay));

                const formattedMessage = getRandomMessage(reminder.message);

                await client.sendMessage(chatId, formattedMessage);

                await db
                    .update(reminders)
                    .set({ status: "sent" })
                    .where(eq(reminders.id, reminder.id));

                console.log(`Reminder ${reminder.id} sent successfully`);

                // Random delay between messages (100ms - 3000ms) to avoid spam detection
                const delay = Math.floor(Math.random() * (3000 - 100 + 1) + 100);
                console.log(`Waiting for ${delay}ms before next message...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } catch (error) {
                console.error(`Failed to send reminder ${reminder.id}:`, error);
                await db
                    .update(reminders)
                    .set({ status: "failed" })
                    .where(eq(reminders.id, reminder.id));
            }
        }
    } catch (error) {
        console.error("Error checking reminders:", error);
    }
}

async function main() {
    console.log("WhatsApp Worker starting (long-running)...");

    await initializeClient();

    // Wait for client to be ready
    await new Promise<void>((resolve) => {
        if (client.info) {
            resolve();
        } else {
            client.on("ready", () => resolve());
        }
    });

    console.log("Starting reminder check loop...");

    // Check reminders every 5 seconds
    const checkInterval = 10000;

    // Initial check
    await checkAndSendReminders();

    // Long-running loop
    setInterval(async () => {
        await checkAndSendReminders();
    }, checkInterval);

    console.log(`Worker running. Checking reminders every ${checkInterval / 1000} seconds.`);
}

main().catch(console.error);
