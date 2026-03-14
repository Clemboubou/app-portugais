import { db } from "@/lib/db";
import { authenticContent } from "@/lib/db/schema";
import { eq, desc, sql, and, or, like } from "drizzle-orm";

export interface AuthenticItem {
  source: string;
  url: string;
  title: string;
  content: string;
  audioUrl?: string;
  level: string;
  theme?: string;
  savedAt: string;
}

export function upsertAuthenticContent(item: AuthenticItem) {
  // Vérifier si l'URL existe déjà
  const existing = db
    .select({ id: authenticContent.id })
    .from(authenticContent)
    .where(eq(authenticContent.url, item.url))
    .get();

  if (existing) return existing;

  return db
    .insert(authenticContent)
    .values({
      source: item.source,
      url: item.url,
      title: item.title,
      content: item.content,
      audioUrl: item.audioUrl ?? null,
      level: item.level,
      theme: item.theme ?? null,
      savedAt: item.savedAt,
      isRead: false,
    })
    .returning({ id: authenticContent.id })
    .get();
}

export function getAuthenticContent(
  limit = 50,
  levelFilter?: string,
  themeFilter?: string
) {
  const conditions = [];
  if (levelFilter) conditions.push(eq(authenticContent.level, levelFilter));
  if (themeFilter) conditions.push(eq(authenticContent.theme, themeFilter));

  return db
    .select()
    .from(authenticContent)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(authenticContent.savedAt))
    .limit(limit)
    .all();
}

export function searchContentByKeywords(
  keywords: string[],
  limit = 50,
  levelFilter?: string
) {
  if (keywords.length === 0) return [];

  const kwConditions = keywords.flatMap((kw) => [
    like(authenticContent.title, `%${kw}%`),
    like(authenticContent.content, `%${kw}%`),
  ]);

  const kwFilter = or(...kwConditions);
  const levelCondition = levelFilter ? eq(authenticContent.level, levelFilter) : undefined;
  const where = levelCondition ? and(levelCondition, kwFilter) : kwFilter;

  return db
    .select()
    .from(authenticContent)
    .where(where)
    .orderBy(desc(authenticContent.savedAt))
    .limit(limit)
    .all();
}

export function markAsRead(id: number) {
  return db
    .update(authenticContent)
    .set({ isRead: true })
    .where(eq(authenticContent.id, id))
    .run();
}

export function getAuthenticContentById(id: number) {
  return (
    db
      .select()
      .from(authenticContent)
      .where(eq(authenticContent.id, id))
      .get() ?? null
  );
}

export function getAuthenticStats() {
  const total = db
    .select({ count: sql<number>`count(*)` })
    .from(authenticContent)
    .get();
  const read = db
    .select({ count: sql<number>`count(*)` })
    .from(authenticContent)
    .where(eq(authenticContent.isRead, true))
    .get();
  return {
    total: total?.count ?? 0,
    read: read?.count ?? 0,
  };
}
