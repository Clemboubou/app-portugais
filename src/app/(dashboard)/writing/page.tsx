"use client";

import { useState } from "react";
import { WritingExercise } from "@/components/writing/writing-exercise";
import { LevelSelector } from "@/components/level-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, PenLine } from "lucide-react";
import writingA1 from "@/../content/writing/A1.json";
import writingA2 from "@/../content/writing/A2.json";
import writingB1 from "@/../content/writing/B1.json";
import writingB2 from "@/../content/writing/B2.json";
import writingC1 from "@/../content/writing/C1.json";

interface WritingPrompt {
  id: string;
  title: string;
  instructions: string;
  model: string;
  level: string;
  minWords: number;
  maxWords: number;
}

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

const WRITING_DATA: Record<Level, WritingPrompt[]> = {
  A1: writingA1.prompts as WritingPrompt[],
  A2: writingA2.prompts as WritingPrompt[],
  B1: writingB1.prompts as WritingPrompt[],
  B2: writingB2.prompts as WritingPrompt[],
  C1: writingC1.prompts as WritingPrompt[],
};

const LEVEL_COLORS: Record<Level, string> = {
  A1: "from-emerald-500 to-emerald-600",
  A2: "from-blue-500 to-blue-600",
  B1: "from-amber-500 to-amber-600",
  B2: "from-violet-500 to-violet-600",
  C1: "from-rose-500 to-rose-600",
};

export default function WritingPage() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const prompts = WRITING_DATA[level];
  const current = prompts.find((p) => p.id === selectedId);

  function handleLevelChange(newLevel: Level) {
    setLevel(newLevel);
    setSelectedId(null);
  }

  if (current) {
    return (
      <div className="space-y-8">
        <div className={`rounded-2xl bg-gradient-to-r ${LEVEL_COLORS[level]} p-6 text-white`}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedId(null)}
              className="text-white hover:bg-white/20 hover:text-white -ml-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Sujets
            </Button>
            <PenLine className="h-5 w-5 opacity-90" />
            <h1 className="text-2xl font-bold">Production écrite</h1>
            <Badge className="rounded-full px-3 py-1 text-sm font-semibold bg-white/20 text-white border-0">
              {level}
            </Badge>
          </div>
          <p className="text-white/80 text-sm mt-2 ml-1">{current.title}</p>
        </div>
        <WritingExercise key={current.id} prompt={current} onComplete={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${LEVEL_COLORS[level]} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <PenLine className="h-6 w-6 opacity-90" />
            <div>
              <h1 className="text-2xl font-bold">Production écrite</h1>
              <p className="text-white/80 text-sm mt-0.5">
                Choisissez un sujet de rédaction pour pratiquer l&apos;écriture.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <LevelSelector selected={level} onChange={handleLevelChange} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            className="rounded-2xl border bg-card shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 hover:border-primary active:scale-[0.98]"
            onClick={() => setSelectedId(prompt.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-semibold leading-tight">
                  {prompt.title}
                </CardTitle>
                <PenLine className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {prompt.instructions}
              </p>
              <Badge variant="outline" className="text-xs rounded-full px-3 py-0.5">
                {prompt.minWords}–{prompt.maxWords} mots
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
