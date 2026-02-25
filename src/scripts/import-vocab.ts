/**
 * Importe le fichier content/vocabulary/supplement.json en DB
 * sans toucher aux leçons existantes.
 * Usage : npx tsx src/scripts/import-vocab.ts
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(process.cwd(), "portugais.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

interface VocabItem {
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  frequency: number;
  tags: string[];
}

async function importVocab() {
  const filePath = path.join(process.cwd(), "content", "vocabulary", "supplement.json");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Fichier introuvable :", filePath);
    process.exit(1);
  }

  const words = JSON.parse(fs.readFileSync(filePath, "utf-8")) as VocabItem[];
  console.log(`📚 ${words.length} mots à importer depuis supplement.json`);

  let inserted = 0;
  let skipped = 0;

  for (const word of words) {
    // Vérifier doublon
    const existing = db
      .select({ id: schema.vocabularyItems.id })
      .from(schema.vocabularyItems)
      .where(eq(schema.vocabularyItems.portuguese, word.portuguese))
      .get();

    if (existing) {
      skipped++;
      continue;
    }

    db.insert(schema.vocabularyItems)
      .values({
        portuguese: word.portuguese,
        phonetic: word.phonetic ?? "",
        french: word.french,
        level: word.level,
        frequency: word.frequency ?? 50,
        tags: JSON.stringify(word.tags ?? []),
      })
      .run();
    inserted++;
  }

  console.log(`✅ ${inserted} mots insérés`);
  console.log(`⏭️  ${skipped} doublons ignorés`);
  sqlite.close();
}

importVocab().catch((err) => {
  console.error("❌ Erreur :", err);
  process.exit(1);
});
