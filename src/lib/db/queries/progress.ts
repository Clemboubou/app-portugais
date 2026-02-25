import { db } from "@/lib/db";
import { userProgress } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export function saveProgress(
  lessonId: number,
  score: number,
  timeSpentSeconds: number
) {
  return db
    .insert(userProgress)
    .values({
      lessonId,
      completedAt: new Date().toISOString(),
      score,
      timeSpentSeconds,
    })
    .returning()
    .get();
}

export function getLessonProgress(lessonId: number) {
  return db
    .select()
    .from(userProgress)
    .where(eq(userProgress.lessonId, lessonId))
    .orderBy(desc(userProgress.completedAt))
    .limit(1)
    .get();
}

export function getCompletedLessonIds(): number[] {
  return db
    .select({ lessonId: userProgress.lessonId })
    .from(userProgress)
    .groupBy(userProgress.lessonId)
    .all()
    .map((r) => r.lessonId);
}

export function getTotalStudyTime(): number {
  const result = db
    .select({ total: sql<number>`COALESCE(SUM(${userProgress.timeSpentSeconds}), 0)` })
    .from(userProgress)
    .get();
  return result?.total ?? 0;
}
