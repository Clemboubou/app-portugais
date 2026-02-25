"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TranslationProps {
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

export function Translation({
  correctAnswer,
  onSubmit,
  isAnswered,
}: TranslationProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit() {
    if (!answer.trim()) return;
    const isCorrect = normalize(answer) === normalize(correctAnswer);
    onSubmit(isCorrect, answer);
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Écrivez votre traduction en portugais..."
        disabled={isAnswered}
        rows={3}
        className={
          isAnswered
            ? normalize(answer) === normalize(correctAnswer)
              ? "border-green-500"
              : "border-red-500"
            : ""
        }
      />
      {!isAnswered && (
        <Button onClick={handleSubmit} disabled={!answer.trim()}>
          Valider
        </Button>
      )}
      {isAnswered && (
        <p className="text-sm text-green-600">
          Réponse attendue : <strong>{correctAnswer}</strong>
        </p>
      )}
    </div>
  );
}
