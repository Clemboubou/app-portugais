import { db } from "@/lib/db";
import { srsCards, vocabularyItems, studySessions, userProgress } from "@/lib/db/schema";
import { eq, lte, and, sql, sum } from "drizzle-orm";

export function getDueCards(limit = 50) {
  const now = new Date().toISOString();
  return db
    .select({
      card: srsCards,
      vocab: vocabularyItems,
    })
    .from(srsCards)
    .leftJoin(
      vocabularyItems,
      and(
        eq(srsCards.itemId, vocabularyItems.id),
        eq(srsCards.itemType, "vocabulary")
      )
    )
    .where(lte(srsCards.nextReview, now))
    .orderBy(srsCards.nextReview)
    .limit(limit)
    .all();
}

export function getDueCardsCount(): number {
  const now = new Date().toISOString();
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(lte(srsCards.nextReview, now))
    .get();
  return result?.count ?? 0;
}

export function getCardById(id: number) {
  return db.select().from(srsCards).where(eq(srsCards.id, id)).get();
}

export function getCardByItem(itemId: number, itemType: string) {
  return db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.itemId, itemId), eq(srsCards.itemType, itemType)))
    .get();
}

export function createSrsCard(
  itemId: number,
  itemType: string
) {
  const now = new Date().toISOString();
  return db
    .insert(srsCards)
    .values({
      itemId,
      itemType,
      state: 0,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      nextReview: now,
      reps: 0,
      lapses: 0,
    })
    .returning()
    .get();
}

export function updateSrsCard(
  id: number,
  updates: {
    state: number;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    lastReview: string;
    nextReview: string;
    reps: number;
    lapses: number;
  }
) {
  return db
    .update(srsCards)
    .set(updates)
    .where(eq(srsCards.id, id))
    .returning()
    .get();
}

export function getAllSrsCardIds(): number[] {
  return db
    .select({ itemId: srsCards.itemId })
    .from(srsCards)
    .where(eq(srsCards.itemType, "vocabulary"))
    .all()
    .map((r) => r.itemId);
}

export function getTotalStudyTimeMinutes(): number {
  const result = db
    .select({ total: sum(studySessions.itemsStudied) })
    .from(studySessions)
    .get();
  return Number(result?.total ?? 0);
}

export function getCompletedLessonIds(): number[] {
  return db
    .select({ lessonId: userProgress.lessonId })
    .from(userProgress)
    .all()
    .map((r) => r.lessonId);
}
