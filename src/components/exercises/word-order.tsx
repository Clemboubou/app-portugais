"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface WordOrderProps {
  correctAnswer: string;
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

export function WordOrder({
  correctAnswer,
  onSubmit,
  isAnswered,
}: WordOrderProps) {
  const words = useMemo(
    () => shuffleArray(correctAnswer.split(/\s+/)),
    [correctAnswer]
  );

  const [selected, setSelected] = useState<number[]>([]);
  const [available, setAvailable] = useState<number[]>(
    words.map((_, i) => i)
  );

  function selectWord(index: number) {
    if (isAnswered) return;
    setSelected([...selected, index]);
    setAvailable(available.filter((i) => i !== index));
  }

  function removeWord(position: number) {
    if (isAnswered) return;
    const index = selected[position];
    setSelected(selected.filter((_, i) => i !== position));
    setAvailable([...available, index]);
  }

  function handleSubmit() {
    const answer = selected.map((i) => words[i]).join(" ");
    const normalizedAnswer = answer.toLowerCase().replace(/[.,!?;:]/g, "").trim();
    const normalizedCorrect = correctAnswer.toLowerCase().replace(/[.,!?;:]/g, "").trim();
    onSubmit(normalizedAnswer === normalizedCorrect, answer);
  }

  return (
    <div className="space-y-4">
      {/* Zone de réponse */}
      <div className="min-h-[3rem] rounded-lg border-2 border-dashed p-2">
        {selected.length === 0 ? (
          <p className="py-1 text-sm text-muted-foreground">
            Cliquez sur les mots pour former la phrase...
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.map((wordIndex, position) => (
              <button
                key={position}
                onClick={() => removeWord(position)}
                disabled={isAnswered}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm",
                  !isAnswered && "hover:bg-destructive/10 cursor-pointer"
                )}
              >
                {words[wordIndex]}
                {!isAnswered && <X className="h-3 w-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mots disponibles */}
      <div className="flex flex-wrap gap-2">
        {available.map((wordIndex) => (
          <button
            key={wordIndex}
            onClick={() => selectWord(wordIndex)}
            disabled={isAnswered}
            className={cn(
              "rounded-md border bg-accent px-3 py-1.5 text-sm font-medium transition-colors",
              !isAnswered && "hover:bg-primary hover:text-primary-foreground cursor-pointer"
            )}
          >
            {words[wordIndex]}
          </button>
        ))}
      </div>

      {!isAnswered && available.length === 0 && selected.length > 0 && (
        <Button onClick={handleSubmit}>Valider</Button>
      )}

      {isAnswered && (
        <p className="text-sm text-green-600">
          Réponse correcte : {correctAnswer}
        </p>
      )}
    </div>
  );
}
