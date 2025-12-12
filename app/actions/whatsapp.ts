"use server";

import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

const AUTH_FOLDER = "auth_info_baileys";

import QRCode from "qrcode";

export async function getWhatsAppStatus() {
    // Read status from DB
    const statusSetting = await db.select().from(settings).where(eq(settings.key, "status")).get();
    const qrSetting = await db.select().from(settings).where(eq(settings.key, "qr")).get();

    let connectionStatus = statusSetting?.value ? JSON.parse(statusSetting.value) : "disconnected";
    let qrCode = qrSetting?.value ? JSON.parse(qrSetting.value) : null;
    let qrDataUrl = undefined;

    if (qrCode) {
        qrDataUrl = await QRCode.toDataURL(qrCode);
    }

    return { connectionStatus, qrCode, qrCodeUrl: qrDataUrl };
}


// Note: Logout is trickier with split processes. 
// Ideally, we write a "command" to DB that the worker listens to.
// For now, if we delete the folder, the worker *might* crash or reconnect endlessly.
// Better approach: We will just delete the folder, and the user must manually restart the worker via PM2 or we assume the worker handles the error gracefully.
export async function logoutWhatsApp() {
    // For now, implementing basic cleanup.
    // In a real production setup, write to a 'commands' table.
    try {
        const authPath = path.resolve(AUTH_FOLDER);
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
        }

        // Reset DB status
        await db.insert(settings).values({ key: "status", value: JSON.stringify("disconnected") })
            .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify("disconnected") } });
        await db.insert(settings).values({ key: "qr", value: JSON.stringify(null) })
            .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(null) } });

        return { success: true };
    } catch (e) {
        console.error("Logout failed", e);
        return { success: false };
    }
}
