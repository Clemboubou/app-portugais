"use client";

import { useState } from "react";
import { ReadingExercise } from "@/components/reading/reading-exercise";
import { LevelSelector } from "@/components/level-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen } from "lucide-react";
import readingA1 from "@/../content/reading/A1.json";
import readingA2 from "@/../content/reading/A2.json";
import readingB1Raw from "@/../content/reading/B1.json";
import readingB2Raw from "@/../content/reading/B2.json";
import readingC1Raw from "@/../content/reading/C1.json";

interface ReadingText {
  id: string;
  title: string;
  content: string;
  level: string;
  questions: {
    id: string;
    type: "mcq" | "true_false";
    question: string;
    options?: string[];
    answer: number | boolean;
  }[];
}

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

// Normalise le format B1-C1 (text/correctAnswer) vers le format A1/A2 (content/answer)
interface RawReadingItem {
  id: string;
  title: string;
  level: string;
  text: string;
  questions: {
    id: string;
    type: "mcq" | "true_false";
    question: string;
    options?: string[];
    correctAnswer: string | boolean | number;
  }[];
}

function normalizeReadingFormat(items: RawReadingItem[]): ReadingText[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.text,
    level: item.level,
    questions: item.questions.map((q) => {
      let answer: number | boolean;
      if (q.type === "true_false") {
        answer = typeof q.correctAnswer === "boolean" ? q.correctAnswer : q.correctAnswer === "true";
      } else if (q.type === "mcq" && q.options) {
        if (typeof q.correctAnswer === "number") {
          answer = q.correctAnswer;
        } else {
          const idx = q.options.indexOf(String(q.correctAnswer));
          answer = idx >= 0 ? idx : 0;
        }
      } else {
        answer = typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
      }
      return {
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        answer,
      };
    }),
  }));
}

const READING_DATA: Record<Level, ReadingText[]> = {
  A1: readingA1.texts as ReadingText[],
  A2: readingA2.texts as ReadingText[],
  B1: normalizeReadingFormat(readingB1Raw as RawReadingItem[]),
  B2: normalizeReadingFormat(readingB2Raw as RawReadingItem[]),
  C1: normalizeReadingFormat(readingC1Raw as RawReadingItem[]),
};

const LEVEL_COLORS: Record<Level, string> = {
  A1: "from-emerald-500 to-emerald-600",
  A2: "from-blue-500 to-blue-600",
  B1: "from-amber-500 to-amber-600",
  B2: "from-violet-500 to-violet-600",
  C1: "from-rose-500 to-rose-600",
};

export default function ReadingPage() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  const texts = READING_DATA[level];
  const current = texts.find((t) => t.id === selectedId);

  function handleLevelChange(newLevel: Level) {
    setLevel(newLevel);
    setSelectedId(null);
  }

  function handleComplete(score: number) {
    if (selectedId) {
      setScores((prev) => ({ ...prev, [selectedId]: score }));
    }
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
              Textes
            </Button>
            <BookOpen className="h-5 w-5 opacity-90" />
            <h1 className="text-2xl font-bold">Compréhension écrite</h1>
            <Badge className="rounded-full px-3 py-1 text-sm font-semibold bg-white/20 text-white border-0">
              {level}
            </Badge>
          </div>
          <p className="text-white/80 text-sm mt-2 ml-1">{current.title}</p>
        </div>
        <ReadingExercise key={current.id} text={current} onComplete={handleComplete} />
      </div>
    );
  }

  const completedCount = texts.filter((t) => scores[t.id] !== undefined).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-r ${LEVEL_COLORS[level]} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 opacity-90" />
            <div>
              <h1 className="text-2xl font-bold">Compréhension écrite</h1>
              <p className="text-white/80 text-sm mt-0.5">
                Choisissez un texte
                {completedCount > 0 && ` · ${completedCount}/${texts.length} terminés`}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <LevelSelector selected={level} onChange={handleLevelChange} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {texts.map((text) => {
          const score = scores[text.id];
          return (
            <Card
              key={text.id}
              className="rounded-2xl border bg-card shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 hover:border-primary active:scale-[0.98]"
              onClick={() => setSelectedId(text.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {text.title}
                  </CardTitle>
                  <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs rounded-full px-3 py-0.5">
                    {text.questions.length} questions
                  </Badge>
                  {score !== undefined && (
                    <Badge
                      variant="secondary"
                      className={`text-xs rounded-full px-3 py-0.5 font-semibold ${score >= 70 ? "text-green-600" : "text-orange-500"}`}
                    >
                      {score}%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
