"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PronunciationAnalysis } from "@/lib/audio/pronunciation";

interface PronunciationFeedbackProps {
  analysis: PronunciationAnalysis;
  onRetry: () => void;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent !";
  if (score >= 80) return "Très bien";
  if (score >= 60) return "Pas mal";
  if (score >= 40) return "À améliorer";
  return "Réessayez";
}

export function PronunciationFeedback({
  analysis,
  onRetry,
  className,
}: PronunciationFeedbackProps) {
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  async function fetchAiFeedback() {
    setIsLoadingAi(true);
    try {
      const resp = await fetch("/api/ai/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expected: analysis.expectedWords.join(" "),
          transcribed: analysis.transcribedWords.join(" "),
          score: analysis.score,
        }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as { feedback: string };
        setAiFeedback(data.feedback);
      }
    } catch {
      setAiFeedback("Impossible d'obtenir le feedback IA. Vérifiez qu'Ollama est en cours d'exécution.");
    } finally {
      setIsLoadingAi(false);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score */}
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold",
            getScoreBg(analysis.score),
            getScoreColor(analysis.score)
          )}
        >
          {analysis.score}
        </div>
        <div>
          <p className={cn("text-lg font-semibold", getScoreColor(analysis.score))}>
            {getScoreLabel(analysis.score)}
          </p>
          <p className="text-sm text-muted-foreground">
            {analysis.errors.length === 0
              ? "Aucune erreur détectée"
              : `${analysis.errors.length} erreur${analysis.errors.length > 1 ? "s" : ""} détectée${analysis.errors.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Diff coloré mot par mot */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Texte attendu :
          </p>
          <div className="flex flex-wrap gap-1">
            {analysis.wordResults.map((wr, i) => (
              <Badge
                key={i}
                variant={wr.correct ? "secondary" : "destructive"}
                className={cn(
                  "text-sm",
                  wr.correct && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                )}
              >
                {wr.word}
              </Badge>
            ))}
          </div>
          {analysis.transcribedWords.length > 0 && (
            <>
              <p className="text-sm font-medium text-muted-foreground mt-3 mb-2">
                Votre prononciation :
              </p>
              <p className="text-sm">{analysis.transcribedWords.join(" ")}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Feedback IA */}
      {aiFeedback ? (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Conseil du professeur
              </span>
            </div>
            <p className="text-sm whitespace-pre-line">{aiFeedback}</p>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAiFeedback}
          disabled={isLoadingAi}
        >
          {isLoadingAi ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          Obtenir un conseil IA
        </Button>
      )}

      {/* Réessayer */}
      <Button onClick={onRetry} variant="default">
        <RefreshCw className="h-4 w-4 mr-2" />
        Réessayer
      </Button>
    </div>
  );
}
