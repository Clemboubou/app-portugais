"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConversationReportProps {
  transcript: Message[];
  scenario: string;
  level: string;
  onRestart: () => void;
}

interface EvaluationResult {
  score: number | null;
  level: string | null;
  feedback: string;
  errors: string[];
}

export function ConversationReport({
  transcript,
  scenario,
  level,
  onRestart,
}: ConversationReportProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const evaluate = async () => {
      try {
        const transcriptText = transcript
          .map((m) => `[${m.role === "user" ? "Apprenant" : "Natif"}] ${m.content}`)
          .join("\n");

        const res = await fetch("/api/ai/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcriptText, scenario, level }),
        });
        const data = (await res.json()) as EvaluationResult;
        setEvaluation(data);
      } catch {
        setEvaluation({
          score: null,
          level: null,
          feedback: "Impossible de générer l'évaluation. Vérifiez qu'Ollama est démarré.",
          errors: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    evaluate();
  }, [transcript, scenario, level]);

  const handleSave = async () => {
    if (!evaluation || isSaving) return;
    setIsSaving(true);
    try {
      await fetch("/api/conversations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          level,
          transcript,
          score: evaluation.score ?? undefined,
          feedback: evaluation.feedback,
        }),
      });
      setSaved(true);
    } catch {
      // Silencieux
    } finally {
      setIsSaving(false);
    }
  };

  const scoreColor =
    evaluation?.score !== null && evaluation?.score !== undefined
      ? evaluation.score >= 80
        ? "text-green-600"
        : evaluation.score >= 60
        ? "text-orange-500"
        : "text-red-500"
      : "";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold">Rapport de conversation</h2>
        <p className="text-muted-foreground text-sm">
          {scenario} — Niveau {level}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <p className="text-center text-sm text-muted-foreground">
            Évaluation en cours avec Ollama...
          </p>
        </div>
      ) : (
        <>
          {/* Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score global</CardTitle>
            </CardHeader>
            <CardContent>
              {evaluation?.score !== null && evaluation?.score !== undefined ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-bold ${scoreColor}`}>
                      {evaluation.score}/100
                    </span>
                    {evaluation.level && (
                      <Badge variant="outline" className="text-sm">
                        Niveau détecté : {evaluation.level}
                      </Badge>
                    )}
                  </div>
                  <Progress value={evaluation.score} className="h-2" />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Score non disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {evaluation?.feedback}
              </p>
            </CardContent>
          </Card>

          {/* Erreurs */}
          {evaluation?.errors && evaluation.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Points à travailler</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.errors.map((err, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Résumé conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Résumé ({transcript.length} messages)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {transcript.filter((m) => m.role === "user").length} messages de votre part,{" "}
                {transcript.filter((m) => m.role === "assistant").length} réponses du natif.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSave}
              disabled={isSaving || saved}
            >
              {saved ? "✓ Sauvegardé" : isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button
              className="flex-1 bg-[#1A56DB] hover:bg-[#1A56DB]/90"
              onClick={onRestart}
            >
              Nouvelle conversation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
