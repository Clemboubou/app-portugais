"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ErrorDetectionProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s+/g, " ");
}

export function ErrorDetection({
  correctAnswer,
  onSubmit,
  isAnswered,
}: ErrorDetectionProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit() {
    if (!answer.trim()) return;
    const isCorrect = normalize(answer) === normalize(correctAnswer);
    onSubmit(isCorrect, answer);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Corrigez la phrase ci-dessus en écrivant la version correcte :
      </p>
      <div className="flex gap-2">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="La phrase corrigée..."
          disabled={isAnswered}
        />
        {!isAnswered && (
          <Button onClick={handleSubmit} disabled={!answer.trim()}>
            Valider
          </Button>
        )}
      </div>
      {isAnswered && (
        <p className="text-sm text-green-600">
          Correction : <strong>{correctAnswer}</strong>
        </p>
      )}
    </div>
  );
}
