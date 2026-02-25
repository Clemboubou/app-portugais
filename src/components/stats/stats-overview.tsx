"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
  dueCards: number;
  totalCards: number;
  completedLessons: number;
  avgScore: number;
  totalTimeSeconds: number;
  totalConversations: number;
  totalSessions: number;
}

function formatTime(seconds: number): string {
  if (seconds === 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m > 0 ? `${m}min` : ""}`;
  return `${m} min`;
}

export function StatsOverview({
  dueCards,
  totalCards,
  completedLessons,
  avgScore,
  totalTimeSeconds,
  totalConversations,
  totalSessions,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Cartes SRS totales",
      value: totalCards,
      sub: `${dueCards} à réviser aujourd'hui`,
      accent: dueCards > 0,
    },
    {
      label: "Leçons complétées",
      value: completedLessons,
      sub: avgScore > 0 ? `Score moyen : ${avgScore}%` : "Aucune encore",
      accent: false,
    },
    {
      label: "Temps d'étude total",
      value: formatTime(totalTimeSeconds),
      sub: `${totalSessions} session${totalSessions > 1 ? "s" : ""}`,
      accent: false,
    },
    {
      label: "Conversations",
      value: totalConversations,
      sub: totalConversations > 0 ? "Avec Ollama" : "Aucune encore",
      accent: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p
              className={`text-3xl font-bold ${
                s.accent ? "text-[#1A56DB]" : ""
              }`}
            >
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
