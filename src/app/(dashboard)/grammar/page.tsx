"use client";

import { useState } from "react";
import { GrammarPointCard } from "@/components/grammar/grammar-point-card";
import { LevelSelector } from "@/components/level-selector";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import grammarA1 from "@/../content/grammar/A1/points.json";
import grammarA2 from "@/../content/grammar/A2/points.json";
import grammarB1 from "@/../content/grammar/B1/points.json";
import grammarB2 from "@/../content/grammar/B2/points.json";
import grammarC1 from "@/../content/grammar/C1/points.json";

interface GrammarPoint {
  id: string;
  title: string;
  level: string;
  explanation?: string;
  description?: string;
  examples: { pt?: string; fr?: string; portuguese?: string; french?: string; explanation?: string }[];
  tip?: string;
}

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

const GRAMMAR_DATA: Record<Level, GrammarPoint[]> = {
  A1: grammarA1 as GrammarPoint[],
  A2: grammarA2 as GrammarPoint[],
  B1: grammarB1 as GrammarPoint[],
  B2: grammarB2 as GrammarPoint[],
  C1: grammarC1 as GrammarPoint[],
};

const LEVEL_COLORS: Record<Level, string> = {
  A1: "from-emerald-500 to-emerald-600",
  A2: "from-blue-500 to-blue-600",
  B1: "from-amber-500 to-amber-600",
  B2: "from-violet-500 to-violet-600",
  C1: "from-rose-500 to-rose-600",
};

export default function GrammarPage() {
  const [level, setLevel] = useState<Level>("A1");
  const points = GRAMMAR_DATA[level];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${LEVEL_COLORS[level]} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="h-6 w-6 opacity-90" />
            <div>
              <h1 className="text-2xl font-bold">Grammaire</h1>
              <p className="text-white/80 text-sm mt-0.5">
                Points de grammaire essentiels du portugais européen.
                Cliquez sur un point pour l&apos;explorer, et utilisez l&apos;IA pour approfondir.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <LevelSelector selected={level} onChange={setLevel} />
          </div>
        </div>
      </div>

      {/* Count indicator */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold">{points.length} points de grammaire</span>
        <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold">
          Niveau {level}
        </Badge>
      </div>

      <div className="space-y-3">
        {points.map((point) => (
          <GrammarPointCard key={point.id} point={point} />
        ))}
      </div>
    </div>
  );
}
