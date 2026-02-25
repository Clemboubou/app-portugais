"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface MultipleChoiceProps {
  correctAnswer: string;
  distractors: string[];
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function MultipleChoice({
  correctAnswer,
  distractors,
  onSubmit,
  isAnswered,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(
    () => shuffleArray([correctAnswer, ...distractors]),
    [correctAnswer, distractors]
  );

  function handleSelect(option: string) {
    if (isAnswered) return;
    setSelected(option);
    onSubmit(option === correctAnswer, option);
  }

  return (
    <div className="grid gap-2">
      {options.map((option, i) => {
        const isSelected = selected === option;
        const isCorrectOption = option === correctAnswer;

        return (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={isAnswered}
            className={cn(
              "w-full rounded-lg border p-3 text-left text-sm transition-colors",
              !isAnswered && "hover:border-primary hover:bg-accent cursor-pointer",
              isAnswered && isSelected && isCorrectOption &&
                "border-green-500 bg-green-50 dark:bg-green-950",
              isAnswered && isSelected && !isCorrectOption &&
                "border-red-500 bg-red-50 dark:bg-red-950",
              isAnswered && !isSelected && isCorrectOption &&
                "border-green-500 bg-green-50/50 dark:bg-green-950/50",
              isAnswered && !isSelected && !isCorrectOption &&
                "opacity-50"
            )}
          >
            <div className="flex items-center gap-2">
              {isAnswered && isCorrectOption && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              )}
              {isAnswered && isSelected && !isCorrectOption && (
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}
              <span dangerouslySetInnerHTML={{ __html: option }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
