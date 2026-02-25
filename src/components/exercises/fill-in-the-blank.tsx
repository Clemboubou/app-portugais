"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FillInTheBlankProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function FillInTheBlank({
  correctAnswer,
  onSubmit,
  isAnswered,
}: FillInTheBlankProps) {
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
    <div className="flex gap-2">
      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Votre réponse..."
        disabled={isAnswered}
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
      {isAnswered && normalize(answer) !== normalize(correctAnswer) && (
        <div className="flex items-center text-sm text-green-600">
          {correctAnswer}
        </div>
      )}
    </div>
  );
}
