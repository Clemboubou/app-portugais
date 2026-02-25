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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sujets
          </Button>
          <h1 className="text-2xl font-bold">Production écrite</h1>
          <Badge variant="secondary">{level}</Badge>
        </div>
        <WritingExercise key={current.id} prompt={current} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Production écrite</h1>
          <p className="text-muted-foreground">
            Choisissez un sujet de rédaction pour pratiquer l&apos;écriture.
          </p>
        </div>
        <LevelSelector selected={level} onChange={handleLevelChange} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
            onClick={() => setSelectedId(prompt.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-tight">
                  {prompt.title}
                </CardTitle>
                <PenLine className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {prompt.instructions}
              </p>
              <Badge variant="outline" className="text-xs">
                {prompt.minWords}–{prompt.maxWords} mots
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
