"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelSelector } from "@/components/level-selector";
import { ListeningExercise } from "@/components/listening/listening-exercise";
import { DictationFull } from "@/components/listening/dictation-full";
import { ChevronLeft } from "lucide-react";
import listeningA1 from "@/../content/listening/A1.json";
import listeningA2 from "@/../content/listening/A2.json";
import listeningB1Raw from "@/../content/listening/B1.json";
import listeningB2Raw from "@/../content/listening/B2.json";
import listeningC1Raw from "@/../content/listening/C1.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

// Format normalisé (compatible A1/A2)
interface NormalizedExercise {
  id: string;
  type: "mcq" | "true_false" | "fill_blank" | "dictation";
  title: string;
  text: string;
  question: string;
  options?: string[];
  correctAnswer: number | boolean | string;
  level: string;
  sentences?: string[];
}

// Convertit le format B1-C1 (transcript + questions[]) vers exercices individuels
interface RawTranscriptItem {
  id: string;
  title: string;
  level: string;
  transcript: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

function normalizeTranscriptFormat(items: RawTranscriptItem[]): NormalizedExercise[] {
  const exercises: NormalizedExercise[] = [];
  for (const item of items) {
    for (const q of item.questions) {
      const correctIndex = q.options.indexOf(q.correctAnswer);
      exercises.push({
        id: `${item.id}-${q.id}`,
        type: "mcq",
        title: item.title,
        text: item.transcript,
        question: q.question,
        options: q.options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
        level: item.level,
      });
    }
  }
  return exercises;
}

const LISTENING_DATA: Record<Level, { exercises: NormalizedExercise[] }> = {
  A1: { exercises: listeningA1.exercises as NormalizedExercise[] },
  A2: { exercises: listeningA2.exercises as NormalizedExercise[] },
  B1: { exercises: normalizeTranscriptFormat(listeningB1Raw as RawTranscriptItem[]) },
  B2: { exercises: normalizeTranscriptFormat(listeningB2Raw as RawTranscriptItem[]) },
  C1: { exercises: normalizeTranscriptFormat(listeningC1Raw as RawTranscriptItem[]) },
};

const TYPE_ICONS: Record<string, string> = {
  mcq: "🎯",
  true_false: "✅",
  fill_blank: "✏️",
  dictation: "🖊️",
};

const TYPE_LABELS: Record<string, string> = {
  mcq: "QCM",
  true_false: "Vrai / Faux",
  fill_blank: "Compléter",
  dictation: "Dictée",
};

export default function ListeningPage() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const exercises = LISTENING_DATA[level].exercises;
  const current = selectedIndex !== null ? exercises[selectedIndex] : undefined;

  function handleLevelChange(newLevel: Level) {
    setLevel(newLevel);
    setSelectedIndex(null);
    setScore({ correct: 0, total: 0 });
  }

  function handleExerciseComplete(correct: boolean) {
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setSelectedIndex(null);
  }

  function handleDictationComplete(dictScore: number) {
    setScore((prev) => ({
      correct: prev.correct + (dictScore >= 60 ? 1 : 0),
      total: prev.total + 1,
    }));
    setSelectedIndex(null);
  }

  // Vue d'un exercice
  if (selectedIndex !== null && current) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedIndex(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Exercices
          </Button>
          <h1 className="text-2xl font-bold">Compréhension orale</h1>
          <Badge variant="secondary">{level}</Badge>
        </div>

        {current.type === "dictation" && current.sentences && (
          <DictationFull
            key={current.id}
            exercise={{
              id: current.id,
              title: current.title,
              sentences: current.sentences,
              level: current.level,
            }}
            onComplete={handleDictationComplete}
          />
        )}

        {current.type === "mcq" && current.options && (
          <ListeningExercise
            key={current.id}
            exercise={{
              id: current.id,
              type: "mcq" as const,
              title: current.title,
              text: current.text,
              question: current.question,
              options: current.options,
              correctAnswer: current.correctAnswer as number,
              level: current.level,
            }}
            onComplete={handleExerciseComplete}
          />
        )}

        {current.type === "true_false" && (
          <ListeningExercise
            key={current.id}
            exercise={{
              id: current.id,
              type: "true_false" as const,
              title: current.title,
              text: current.text,
              question: current.question,
              correctAnswer: current.correctAnswer as boolean,
              level: current.level,
            }}
            onComplete={handleExerciseComplete}
          />
        )}

        {current.type === "fill_blank" && (
          <ListeningExercise
            key={current.id}
            exercise={{
              id: current.id,
              type: "fill_blank" as const,
              title: current.title,
              text: current.text,
              question: current.question,
              correctAnswer: current.correctAnswer as string,
              level: current.level,
            }}
            onComplete={handleExerciseComplete}
          />
        )}
      </div>
    );
  }

  // Grille de sélection
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compréhension orale</h1>
          <p className="text-muted-foreground">
            Choisissez un exercice · {score.total > 0 && `${score.correct}/${score.total} réussis`}
          </p>
        </div>
        <LevelSelector selected={level} onChange={handleLevelChange} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {exercises.map((ex, i) => (
          <Card
            key={ex.id}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
            onClick={() => setSelectedIndex(i)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-tight">
                  {ex.title}
                </CardTitle>
                <span className="text-xl ml-2 shrink-0">
                  {TYPE_ICONS[ex.type] ?? "🎧"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-xs">
                {TYPE_LABELS[ex.type] ?? ex.type}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
