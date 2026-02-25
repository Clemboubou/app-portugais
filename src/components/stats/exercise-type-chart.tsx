"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExerciseTypeData {
  type: string;
  avgScore: number;
  completions: number;
}

interface ExerciseTypeChartProps {
  data: ExerciseTypeData[];
}

const TYPE_LABELS: Record<string, string> = {
  vocabulary: "Vocabulaire",
  grammar: "Grammaire",
  listening: "Écoute",
  speaking: "Expression orale",
  reading: "Lecture",
  writing: "Écriture",
  conversation: "Conversation",
  cultural: "Culturel",
  pronunciation: "Prononciation",
};

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-orange-400";
  return "bg-red-400";
}

export function ExerciseTypeChart({ data }: ExerciseTypeChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Réussite par type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune donnée disponible.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Réussite par type d&apos;activité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {data.map(({ type, avgScore, completions }) => (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {TYPE_LABELS[type] ?? type}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {completions} session{completions > 1 ? "s" : ""}
                </span>
                <span className="font-bold text-sm w-10 text-right">
                  {avgScore}%
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreBarColor(avgScore)}`}
                style={{ width: `${avgScore}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
