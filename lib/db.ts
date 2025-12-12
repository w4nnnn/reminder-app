import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let _db: BetterSQLite3Database<typeof schema> | null = null;

function getDatabase() {
    if (!_db) {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL environment variable is required");
        }
        const sqlite = new Database(process.env.DATABASE_URL);
        _db = drizzle(sqlite, { schema });
    }
    return _db;
}

// Export for use in auth.ts
export function getDb() {
    return getDatabase();
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
    get(_, prop) {
        const database = getDatabase();
        const value = database[prop as keyof typeof database];
        if (typeof value === "function") {
            return value.bind(database);
        }
        return value;
    },
});



