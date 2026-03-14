import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "portugais.db");
const sqlite = new Database(dbPath);

// Activer WAL mode pour de meilleures performances
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("cache_size = -32000"); // 32 MB cache mémoire
sqlite.pragma("temp_store = MEMORY");

// Index sur les colonnes les plus requêtées
sqlite.exec(`
  CREATE INDEX IF NOT EXISTS idx_srs_next_review ON srs_cards(next_review);
  CREATE INDEX IF NOT EXISTS idx_srs_item ON srs_cards(item_id, item_type);
  CREATE INDEX IF NOT EXISTS idx_sessions_started ON study_sessions(started_at);
  CREATE INDEX IF NOT EXISTS idx_progress_lesson ON user_progress(lesson_id);
  CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
  CREATE INDEX IF NOT EXISTS idx_authentic_level ON authentic_content(level, is_read);
`);

export const db = drizzle(sqlite, { schema });
