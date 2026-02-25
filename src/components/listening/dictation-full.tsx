"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AudioPlayerAdvanced } from "./audio-player-advanced";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DictationExercise {
  id: string;
  title: string;
  sentences: string[];
  level: string;
}

interface DictationFullProps {
  exercise: DictationExercise;
  onComplete: (score: number) => void;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"""''«»]/g, "")
    .replace(/\s+/g, " ");
}

function sentenceScore(expected: string, given: string): number {
  const exp = normalize(expected);
  const giv = normalize(given);
  if (exp === giv) return 100;

  const expWords = exp.split(" ");
  const givWords = giv.split(" ");
  let correct = 0;
  for (let i = 0; i < expWords.length; i++) {
    if (givWords[i] === expWords[i]) correct++;
  }
  return Math.round((correct / expWords.length) * 100);
}

export function DictationFull({ exercise, onComplete }: DictationFullProps) {
  const [answers, setAnswers] = useState<string[]>(
    Array.from({ length: exercise.sentences.length }, () => "")
  );
  const [isChecked, setIsChecked] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  function handleCheck() {
    const newScores = exercise.sentences.map((s, i) =>
      sentenceScore(s, answers[i])
    );
    setScores(newScores);
    setIsChecked(true);
  }

  function handleComplete() {
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    onComplete(avg);
  }

  const globalScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{exercise.title}</CardTitle>
          <Badge variant="outline">{exercise.level}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Écoutez chaque phrase et écrivez ce que vous entendez.
        </p>

        {/* Phrases */}
        <div className="space-y-4">
          {exercise.sentences.map((sentence, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="shrink-0">
                  {i + 1}
                </Badge>
                <AudioPlayerAdvanced text={sentence} />
              </div>
              <Input
                value={answers[i]}
                onChange={(e) => !isChecked && updateAnswer(i, e.target.value)}
                disabled={isChecked}
                placeholder={`Phrase ${i + 1}…`}
              />
              {isChecked && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {scores[i] >= 80 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <span className="text-sm font-medium">
                      {scores[i]}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Attendu : <span className="font-medium text-foreground">{sentence}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Score global */}
        {isChecked && (
          <div className={cn(
            "p-4 rounded-lg text-center",
            globalScore >= 80 ? "bg-green-50 dark:bg-green-900/20" : "bg-yellow-50 dark:bg-yellow-900/20"
          )}>
            <p className="text-2xl font-bold">{globalScore}%</p>
            <p className="text-sm text-muted-foreground">Score global</p>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-2">
          {!isChecked && (
            <Button
              onClick={handleCheck}
              disabled={answers.some((a) => a.trim() === "")}
            >
              Vérifier
            </Button>
          )}
          {isChecked && (
            <Button onClick={handleComplete}>
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
