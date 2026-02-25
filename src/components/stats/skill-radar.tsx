"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SkillData {
  skill: string;
  score: number;
  sessions: number;
}

interface SkillRadarProps {
  skills: SkillData[];
}

const SKILL_LABELS: Record<string, string> = {
  CO: "Compréhension orale",
  CE: "Compréhension écrite",
  PO: "Production orale",
  PE: "Production écrite",
  IO: "Interaction orale",
};

const SKILL_COLORS: Record<string, string> = {
  CO: "bg-purple-500",
  CE: "bg-green-500",
  PO: "bg-orange-500",
  PE: "bg-blue-500",
  IO: "bg-pink-500",
};

export function SkillRadar({ skills }: SkillRadarProps) {
  const maxScore = 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Compétences CECRL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {skills.map(({ skill, score, sessions }) => (
          <div key={skill} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${SKILL_COLORS[skill] ?? "bg-gray-400"}`} />
                <span className="text-muted-foreground">
                  {SKILL_LABELS[skill] ?? skill}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sessions > 0 ? (
                  <span className="font-bold text-sm">{score}%</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Pas de données</span>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${SKILL_COLORS[skill] ?? "bg-gray-400"}`}
                style={{ width: `${Math.min(score, maxScore)}%` }}
              />
            </div>
          </div>
        ))}

        {skills.every((s) => s.sessions === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complétez des leçons pour voir vos compétences.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
