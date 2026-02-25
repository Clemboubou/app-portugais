"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GuidedProductionProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

export function GuidedProduction({
  correctAnswer,
  onSubmit,
  isAnswered,
}: GuidedProductionProps) {
  const [answer, setAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: answer,
          context: `Réponse attendue : ${correctAnswer}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiFeedback(data.correction);
      }
    } catch {
      // Silently continue without AI feedback
    }

    setIsLoading(false);

    // Comparaison basique pour le score
    const normalize = (t: string) =>
      t.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,!?;:'"]/g, "");
    const isCorrect = normalize(answer) === normalize(correctAnswer);
    onSubmit(isCorrect, answer);
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Écrivez votre réponse en portugais..."
        disabled={isAnswered || isLoading}
        rows={3}
      />
      {!isAnswered && (
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Correction en cours...
            </>
          ) : (
            "Soumettre à la correction"
          )}
        </Button>
      )}
      {aiFeedback && (
        <div className="rounded-lg border bg-blue-50 p-3 text-sm dark:bg-blue-950">
          <p className="mb-1 font-medium text-blue-700 dark:text-blue-300">
            Correction IA :
          </p>
          <p className="whitespace-pre-wrap text-blue-900 dark:text-blue-100">
            {aiFeedback}
          </p>
        </div>
      )}
      {isAnswered && (
        <p className="text-sm text-green-600">
          Réponse suggérée : <strong>{correctAnswer}</strong>
        </p>
      )}
    </div>
  );
}
