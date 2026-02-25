import { db } from "@/lib/db";
import { vocabularyItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export function getVocabularyByLevel(level: string) {
  return db
    .select()
    .from(vocabularyItems)
    .where(eq(vocabularyItems.level, level))
    .orderBy(vocabularyItems.frequency)
    .all();
}

export function getVocabularyById(id: number) {
  return db
    .select()
    .from(vocabularyItems)
    .where(eq(vocabularyItems.id, id))
    .get();
}

export function searchVocabulary(query: string) {
  const search = `%${query}%`;
  return db
    .select()
    .from(vocabularyItems)
    .where(
      sql`${vocabularyItems.portuguese} LIKE ${search} OR ${vocabularyItems.french} LIKE ${search}`
    )
    .limit(20)
    .all();
}

export function addVocabularyItem(data: {
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  tags: string[];
}) {
  // Vérifier si le mot existe déjà
  const existing = db
    .select()
    .from(vocabularyItems)
    .where(eq(vocabularyItems.portuguese, data.portuguese))
    .get();

  if (existing) return { id: existing.id, created: false };

  const result = db
    .insert(vocabularyItems)
    .values({
      portuguese: data.portuguese,
      phonetic: data.phonetic,
      french: data.french,
      level: data.level,
      frequency: 50,
      tags: JSON.stringify(data.tags),
    })
    .returning({ id: vocabularyItems.id })
    .get();

  return { id: result.id, created: true };
}

export function getAllVocabulary() {
  return db
    .select()
    .from(vocabularyItems)
    .orderBy(vocabularyItems.frequency)
    .all();
}

export function getVocabularyCount(): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(vocabularyItems)
    .get();
  return result?.count ?? 0;
}
