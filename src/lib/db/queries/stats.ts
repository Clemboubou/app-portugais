import { db } from "@/lib/db";
import {
  srsCards,
  userProgress,
  conversations,
  studySessions,
  errorLog,
  lessons,
} from "@/lib/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";

// ─── SRS ────────────────────────────────────────────────────────────────────

export function getSrsStats() {
  const byState = db
    .select({
      state: srsCards.state,
      count: sql<number>`count(*)`,
    })
    .from(srsCards)
    .groupBy(srsCards.state)
    .all();

  const now = new Date().toISOString();
  const due = db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .where(sql`${srsCards.nextReview} <= ${now}`)
    .get();

  const total = db
    .select({ count: sql<number>`count(*)` })
    .from(srsCards)
    .get();

  return {
    byState, // [{ state: 0|1|2|3, count }]
    dueCount: due?.count ?? 0,
    totalCards: total?.count ?? 0,
  };
}

// ─── LEÇONS ─────────────────────────────────────────────────────────────────

export function getLessonStats() {
  const completedCount = db
    .select({ count: sql<number>`count(distinct ${userProgress.lessonId})` })
    .from(userProgress)
    .get();

  const avgScore = db
    .select({ avg: sql<number>`ROUND(AVG(${userProgress.score}), 1)` })
    .from(userProgress)
    .get();

  const totalTime = db
    .select({
      total: sql<number>`COALESCE(SUM(${userProgress.timeSpentSeconds}), 0)`,
    })
    .from(userProgress)
    .get();

  const recentLessons = db
    .select({
      lessonId: userProgress.lessonId,
      score: userProgress.score,
      completedAt: userProgress.completedAt,
      timeSpentSeconds: userProgress.timeSpentSeconds,
      title: lessons.title,
      type: lessons.type,
    })
    .from(userProgress)
    .leftJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .orderBy(desc(userProgress.completedAt))
    .limit(10)
    .all();

  return {
    completedCount: completedCount?.count ?? 0,
    avgScore: avgScore?.avg ?? 0,
    totalTimeSeconds: totalTime?.total ?? 0,
    recentLessons,
  };
}

// ─── CONVERSATIONS ───────────────────────────────────────────────────────────

export function getConversationStats() {
  const total = db
    .select({ count: sql<number>`count(*)` })
    .from(conversations)
    .get();

  const avgScore = db
    .select({ avg: sql<number>`ROUND(AVG(${conversations.score}), 1)` })
    .from(conversations)
    .where(sql`${conversations.score} IS NOT NULL`)
    .get();

  const recent = db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.startedAt))
    .limit(5)
    .all();

  return {
    totalCount: total?.count ?? 0,
    avgScore: avgScore?.avg ?? null,
    recent,
  };
}

// ─── SESSIONS ────────────────────────────────────────────────────────────────

export function getStudySessionStats() {
  const total = db
    .select({ count: sql<number>`count(*)` })
    .from(studySessions)
    .get();

  // Sessions des 30 derniers jours par type
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const byType = db
    .select({
      sessionType: studySessions.sessionType,
      count: sql<number>`count(*)`,
      totalItems: sql<number>`COALESCE(SUM(${studySessions.itemsStudied}), 0)`,
    })
    .from(studySessions)
    .where(gte(studySessions.startedAt, thirtyDaysAgo))
    .groupBy(studySessions.sessionType)
    .all();

  // Activité par jour (7 derniers jours)
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const dailyActivity = db
    .select({
      date: sql<string>`date(${studySessions.startedAt})`,
      count: sql<number>`count(*)`,
      items: sql<number>`COALESCE(SUM(${studySessions.itemsStudied}), 0)`,
    })
    .from(studySessions)
    .where(gte(studySessions.startedAt, sevenDaysAgo))
    .groupBy(sql`date(${studySessions.startedAt})`)
    .all();

  return {
    totalSessions: total?.count ?? 0,
    byType,
    dailyActivity,
  };
}

// ─── ERREURS ─────────────────────────────────────────────────────────────────

export function getTopErrors(limit = 8) {
  return db
    .select()
    .from(errorLog)
    .orderBy(desc(errorLog.count))
    .limit(limit)
    .all();
}

// ─── HEATMAP 365 JOURS ──────────────────────────────────────────────────────

export function getYearlyActivity() {
  const oneYearAgo = new Date(
    Date.now() - 365 * 24 * 60 * 60 * 1000
  ).toISOString();

  return db
    .select({
      date: sql<string>`date(${studySessions.startedAt})`,
      count: sql<number>`count(*)`,
      items: sql<number>`COALESCE(SUM(${studySessions.itemsStudied}), 0)`,
    })
    .from(studySessions)
    .where(gte(studySessions.startedAt, oneYearAgo))
    .groupBy(sql`date(${studySessions.startedAt})`)
    .all();
}

// ─── COMPÉTENCES PAR TYPE DE LEÇON ──────────────────────────────────────────

export function getSkillStats() {
  // Score moyen par type de leçon (approximation des compétences)
  const byType = db
    .select({
      type: lessons.type,
      avgScore: sql<number>`ROUND(AVG(${userProgress.score}) * 100, 1)`,
      count: sql<number>`count(*)`,
    })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .groupBy(lessons.type)
    .all();

  // Mapper vers les 5 compétences CECRL
  const skillMap: Record<string, { total: number; count: number }> = {
    CO: { total: 0, count: 0 }, // Compréhension orale
    CE: { total: 0, count: 0 }, // Compréhension écrite
    PO: { total: 0, count: 0 }, // Production orale
    PE: { total: 0, count: 0 }, // Production écrite
    IO: { total: 0, count: 0 }, // Interaction orale
  };

  const typeToSkill: Record<string, string[]> = {
    listening: ["CO"],
    reading: ["CE"],
    speaking: ["PO"],
    pronunciation: ["PO"],
    writing: ["PE"],
    conversation: ["IO", "PO", "CO"],
    grammar: ["CE", "PE"],
    vocabulary: ["CE", "CO"],
    cultural: ["CE"],
  };

  for (const row of byType) {
    const skills = typeToSkill[row.type] ?? [];
    for (const skill of skills) {
      skillMap[skill].total += row.avgScore * row.count;
      skillMap[skill].count += row.count;
    }
  }

  return Object.entries(skillMap).map(([skill, data]) => ({
    skill,
    score: data.count > 0 ? Math.round(data.total / data.count) : 0,
    sessions: data.count,
  }));
}

// ─── TAUX DE RÉUSSITE PAR TYPE D'EXERCICE ───────────────────────────────────

export function getExerciseTypeStats() {
  // On ne peut pas facilement tracker par exercice avec le schéma actuel
  // On utilise le score par type de leçon comme proxy
  return db
    .select({
      type: lessons.type,
      avgScore: sql<number>`ROUND(AVG(${userProgress.score}) * 100, 1)`,
      completions: sql<number>`count(*)`,
    })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .groupBy(lessons.type)
    .orderBy(sql`AVG(${userProgress.score}) DESC`)
    .all();
}

// ─── OVERVIEW GLOBALE ────────────────────────────────────────────────────────

export function getOverviewStats() {
  const srs = getSrsStats();
  const lessonStats = getLessonStats();
  const convStats = getConversationStats();
  const sessionStats = getStudySessionStats();
  const yearlyActivity = getYearlyActivity();
  const skills = getSkillStats();
  const exerciseTypes = getExerciseTypeStats();

  return {
    srs,
    lessons: lessonStats,
    conversations: convStats,
    sessions: sessionStats,
    yearlyActivity,
    skills,
    exerciseTypes,
  };
}
