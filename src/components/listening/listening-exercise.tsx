"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AudioPlayerAdvanced } from "./audio-player-advanced";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface McqExercise {
  id: string;
  type: "mcq";
  title: string;
  text: string;
  question: string;
  options: string[];
  correctAnswer: number;
  level: string;
}

interface TrueFalseExercise {
  id: string;
  type: "true_false";
  title: string;
  text: string;
  question: string;
  correctAnswer: boolean;
  level: string;
}

interface FillBlankExercise {
  id: string;
  type: "fill_blank";
  title: string;
  text: string;
  question: string;
  correctAnswer: string;
  level: string;
}

type ListeningExerciseData = McqExercise | TrueFalseExercise | FillBlankExercise;

interface ListeningExerciseProps {
  exercise: ListeningExerciseData;
  onComplete: (correct: boolean) => void;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?]/g, "");
}

export function ListeningExercise({ exercise, onComplete }: ListeningExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function checkAnswer() {
    if (selectedAnswer === null) return;

    let correct = false;
    if (exercise.type === "mcq") {
      correct = selectedAnswer === exercise.correctAnswer;
    } else if (exercise.type === "true_false") {
      correct = selectedAnswer === exercise.correctAnswer;
    } else if (exercise.type === "fill_blank") {
      correct = normalize(String(selectedAnswer)) === normalize(exercise.correctAnswer);
    }

    setIsCorrect(correct);
    setIsAnswered(true);
  }

  function handleNext() {
    onComplete(isCorrect);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{exercise.title}</CardTitle>
          <Badge variant="outline">{exercise.level}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lecteur audio */}
        <AudioPlayerAdvanced text={exercise.text} />

        {/* Question */}
        <p className="font-medium">{exercise.type === "fill_blank" ? exercise.question : exercise.question}</p>

        {/* Options selon le type */}
        {exercise.type === "mcq" && (
          <div className="space-y-2">
            {exercise.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !isAnswered && setSelectedAnswer(i)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  selectedAnswer === i && !isAnswered && "border-primary bg-primary/5",
                  isAnswered && i === exercise.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-900/20",
                  isAnswered && selectedAnswer === i && i !== exercise.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-900/20",
                  !isAnswered && "hover:bg-muted/50 cursor-pointer"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {exercise.type === "true_false" && (
          <div className="flex gap-3">
            {[true, false].map((val) => (
              <Button
                key={String(val)}
                variant={
                  isAnswered
                    ? val === exercise.correctAnswer
                      ? "default"
                      : selectedAnswer === val
                      ? "destructive"
                      : "outline"
                    : selectedAnswer === val
                    ? "default"
                    : "outline"
                }
                onClick={() => !isAnswered && setSelectedAnswer(val)}
                disabled={isAnswered}
                className="flex-1"
              >
                {val ? "Vrai" : "Faux"}
              </Button>
            ))}
          </div>
        )}

        {exercise.type === "fill_blank" && (
          <Input
            value={String(selectedAnswer ?? "")}
            onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
            disabled={isAnswered}
            placeholder="Votre réponse…"
            onKeyDown={(e) => e.key === "Enter" && !isAnswered && checkAnswer()}
          />
        )}

        {/* Feedback */}
        {isAnswered && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg",
            isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
          )}>
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>
              {isCorrect ? "Bonne réponse !" : `Réponse incorrecte. La bonne réponse était : ${
                exercise.type === "mcq"
                  ? exercise.options[exercise.correctAnswer]
                  : exercise.type === "true_false"
                  ? exercise.correctAnswer ? "Vrai" : "Faux"
                  : exercise.correctAnswer
              }`}
            </span>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-2">
          {!isAnswered && (
            <Button onClick={checkAnswer} disabled={selectedAnswer === null}>
              Vérifier
            </Button>
          )}
          {isAnswered && (
            <Button onClick={handleNext}>
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
