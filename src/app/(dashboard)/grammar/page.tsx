"use client";

import { useState } from "react";
import { GrammarPointCard } from "@/components/grammar/grammar-point-card";
import { LevelSelector } from "@/components/level-selector";
import grammarA1 from "@/../content/grammar/A1/points.json";
import grammarA2 from "@/../content/grammar/A2/points.json";
import grammarB1 from "@/../content/grammar/B1/points.json";
import grammarB2 from "@/../content/grammar/B2/points.json";
import grammarC1 from "@/../content/grammar/C1/points.json";

interface GrammarPoint {
  id: string;
  title: string;
  level: string;
  explanation: string;
  examples: { pt: string; fr: string }[];
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

export default function GrammarPage() {
  const [level, setLevel] = useState<Level>("A1");
  const points = GRAMMAR_DATA[level];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grammaire</h1>
          <p className="text-muted-foreground">
            Points de grammaire essentiels du portugais européen.
            Cliquez sur un point pour l&apos;explorer, et utilisez l&apos;IA pour approfondir.
          </p>
        </div>
        <LevelSelector selected={level} onChange={setLevel} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{points.length} points</span>
        <span>·</span>
        <span>Niveau {level}</span>
      </div>

      <div className="space-y-3">
        {points.map((point) => (
          <GrammarPointCard key={point.id} point={point} />
        ))}
      </div>
    </div>
  );
}
