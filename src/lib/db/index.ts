import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "portugais.db");
const sqlite = new Database(dbPath);

// Activer WAL mode pour de meilleures performances
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
