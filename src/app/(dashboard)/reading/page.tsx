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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Textes
          </Button>
          <h1 className="text-2xl font-bold">Compréhension écrite</h1>
          <Badge variant="secondary">{level}</Badge>
        </div>
        <ReadingExercise key={current.id} text={current} onComplete={handleComplete} />
      </div>
    );
  }

  const completedCount = texts.filter((t) => scores[t.id] !== undefined).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compréhension écrite</h1>
          <p className="text-muted-foreground">
            Choisissez un texte · {completedCount > 0 && `${completedCount}/${texts.length} terminés`}
          </p>
        </div>
        <LevelSelector selected={level} onChange={handleLevelChange} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {texts.map((text) => {
          const score = scores[text.id];
          return (
            <Card
              key={text.id}
              className="cursor-pointer transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
              onClick={() => setSelectedId(text.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium leading-tight">
                    {text.title}
                  </CardTitle>
                  <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground ml-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {text.questions.length} questions
                  </Badge>
                  {score !== undefined && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${score >= 70 ? "text-green-600" : "text-orange-500"}`}
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
