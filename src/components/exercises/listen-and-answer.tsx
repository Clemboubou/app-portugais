"use client";

import { useState } from "react";
import { AudioPlayerAdvanced } from "@/components/listening/audio-player-advanced";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ListenAndAnswerProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[.,!?;:"""''«»]/g, "").replace(/\s+/g, " ");
}

/**
 * Exercice d'écoute intégré au LessonEngine.
 * L'apprenant écoute un audio (TTS) et écrit ce qu'il entend.
 */
export function ListenAndAnswer({
  correctAnswer,
  onSubmit,
  isAnswered,
}: ListenAndAnswerProps) {
  const [answer, setAnswer] = useState("");

  function handleCheck() {
    const correct = normalize(answer) === normalize(correctAnswer);
    onSubmit(correct, answer);
  }

  return (
    <div className="space-y-3">
      <AudioPlayerAdvanced text={correctAnswer} />

      <Input
        value={answer}
        onChange={(e) => !isAnswered && setAnswer(e.target.value)}
        disabled={isAnswered}
        placeholder="Écrivez ce que vous entendez…"
        onKeyDown={(e) => e.key === "Enter" && !isAnswered && answer.trim() && handleCheck()}
      />

      {!isAnswered && (
        <Button onClick={handleCheck} disabled={!answer.trim()}>
          Vérifier
        </Button>
      )}
    </div>
  );
}
