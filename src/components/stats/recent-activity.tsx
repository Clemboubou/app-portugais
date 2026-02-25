"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecentLesson {
  lessonId: number;
  score: number;
  completedAt: string;
  timeSpentSeconds: number;
  title: string | null;
  type: string | null;
}

interface RecentConversation {
  id: number;
  scenario: string;
  level: string;
  startedAt: string;
  score: number | null;
}

interface DailyActivity {
  date: string;
  count: number;
  items: number;
}

interface SessionByType {
  sessionType: string;
  count: number;
  totalItems: number;
}

interface RecentActivityProps {
  recentLessons: RecentLesson[];
  recentConversations: RecentConversation[];
  dailyActivity: DailyActivity[];
  sessionsByType: SessionByType[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}

const LESSON_TYPE_LABELS: Record<string, string> = {
  vocabulary: "Vocabulaire",
  grammar: "Grammaire",
  listening: "Écoute",
  speaking: "Expression",
  reading: "Lecture",
  writing: "Écriture",
  conversation: "Conversation",
  cultural: "Culturel",
  pronunciation: "Prononciation",
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  lesson: "Leçons",
  review: "Révisions",
  conversation: "Conversations",
  reading: "Lecture",
  listening: "Écoute",
};

// ─── Composant activité hebdomadaire (mini heatmap) ──────────────────────────

function WeeklyActivity({ dailyActivity }: { dailyActivity: DailyActivity[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const activity = dailyActivity.find((a) => a.date === dateStr);
    return {
      date: dateStr,
      day: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      items: activity?.items ?? 0,
      sessions: activity?.count ?? 0,
    };
  });

  const maxItems = Math.max(...days.map((d) => d.items), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activité — 7 derniers jours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 h-20">
          {days.map((day) => {
            const pct = maxItems > 0 ? (day.items / maxItems) * 100 : 0;
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div className="flex-1 flex items-end w-full">
                  <div
                    className={`w-full rounded-sm transition-all ${
                      day.items > 0
                        ? isToday
                          ? "bg-[#1A56DB]"
                          : "bg-[#1A56DB]/50"
                        : "bg-gray-100"
                    }`}
                    style={{ height: `${Math.max(pct, day.items > 0 ? 8 : 4)}%` }}
                    title={`${day.day} : ${day.items} éléments étudiés`}
                  />
                </div>
                <span
                  className={`text-xs ${
                    isToday ? "font-semibold text-[#1A56DB]" : "text-muted-foreground"
                  }`}
                >
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function RecentActivity({
  recentLessons,
  recentConversations,
  dailyActivity,
  sessionsByType,
}: RecentActivityProps) {
  return (
    <div className="space-y-4">
      {/* Activité hebdo */}
      <WeeklyActivity dailyActivity={dailyActivity} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sessions par type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sessions par activité (30j)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sessionsByType.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune session enregistrée.
              </p>
            ) : (
              sessionsByType.map(({ sessionType, count, totalItems }) => {
                const maxCount = Math.max(...sessionsByType.map((s) => s.count), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={sessionType} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {SESSION_TYPE_LABELS[sessionType] ?? sessionType}
                      </span>
                      <span className="font-medium">
                        {count} session{count > 1 ? "s" : ""} · {totalItems} éléments
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1A56DB]/60 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Conversations récentes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversations récentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune conversation enregistrée.
              </p>
            ) : (
              recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-xs leading-tight">{conv.scenario}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        {conv.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(conv.startedAt)}
                      </span>
                    </div>
                  </div>
                  {conv.score !== null && (
                    <span
                      className={`text-sm font-bold ${scoreColor(conv.score)}`}
                    >
                      {conv.score}%
                    </span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leçons récentes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Leçons récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune leçon complétée pour l&apos;instant.
            </p>
          ) : (
            <div className="space-y-2">
              {recentLessons.map((lesson, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs truncate">
                      {lesson.title ?? `Leçon #${lesson.lessonId}`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {lesson.type && (
                        <Badge variant="outline" className="text-xs h-4 px-1">
                          {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(lesson.completedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span
                      className={`text-sm font-bold ${scoreColor(Math.round(lesson.score * 100))}`}
                    >
                      {Math.round(lesson.score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
