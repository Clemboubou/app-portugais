"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";

interface WritingPrompt {
  id: string;
  title: string;
  instructions: string;
  model: string;
  level: string;
  minWords: number;
  maxWords: number;
}

interface WritingExerciseProps {
  prompt: WritingPrompt;
  onComplete: () => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WritingExercise({ prompt, onComplete }: WritingExerciseProps) {
  const [text, setText] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const wordCount = countWords(text);
  const isTooShort = wordCount < prompt.minWords;
  const isTooLong = wordCount > prompt.maxWords;
  const isValid = wordCount >= prompt.minWords && wordCount <= prompt.maxWords;

  const handleCorrect = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setCorrection(null);
    try {
      const res = await fetch("/api/ai/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context: `Exercice d'écriture A1 : ${prompt.title}. Consigne : ${prompt.instructions}`,
        }),
      });
      const data = (await res.json()) as { correction?: string; error?: string };
      setCorrection(data.correction ?? data.error ?? "Erreur lors de la correction.");
    } catch {
      setCorrection("Impossible de contacter Ollama. Vérifiez qu'il est démarré.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{prompt.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{prompt.instructions}</p>
        </div>
        <Badge variant="outline">{prompt.level}</Badge>
      </div>

      {/* Modèle (collapsible) */}
      <Card className="border-dashed">
        <CardHeader
          className="flex flex-row items-center justify-between p-3 cursor-pointer"
          onClick={() => setShowModel(!showModel)}
        >
          <span className="text-sm font-medium text-muted-foreground">
            Voir un exemple de réponse
          </span>
          {showModel ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        {showModel && (
          <CardContent className="pt-0 pb-3 px-3">
            <p className="text-sm whitespace-pre-wrap text-gray-700 italic">
              {prompt.model}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Zone de saisie */}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrivez votre texte en portugais européen ici..."
          className="min-h-[160px] resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span
            className={
              isTooShort
                ? "text-orange-500"
                : isTooLong
                ? "text-red-500"
                : isValid
                ? "text-green-600"
                : ""
            }
          >
            {wordCount} mot{wordCount > 1 ? "s" : ""} (min. {prompt.minWords} — max.{" "}
            {prompt.maxWords})
          </span>
          {isValid && <span className="text-green-600 font-medium">✓ Longueur correcte</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleCorrect}
          disabled={!text.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? "Correction en cours..." : "Corriger avec l'IA"}
        </Button>
        <Button
          onClick={onComplete}
          disabled={!correction}
          className="flex-1 bg-[#1A56DB] hover:bg-[#1A56DB]/90"
        >
          Exercice suivant
        </Button>
      </div>

      {/* Résultat correction */}
      {isLoading && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Correction par Ollama en cours...
            </p>
          </CardContent>
        </Card>
      )}
      {correction && !isLoading && (
        <Card className="border-[#1A56DB]/20 bg-blue-50/30">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm text-[#1A56DB]">
              Correction du professeur (Ollama)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{correction}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
