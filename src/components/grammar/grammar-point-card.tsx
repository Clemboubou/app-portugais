"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface Example {
  pt?: string;
  fr?: string;
  portuguese?: string;
  french?: string;
  explanation?: string;
}

interface GrammarPoint {
  id: string;
  title: string;
  level: string;
  explanation?: string;
  description?: string;
  examples: Example[];
  tip?: string;
}

interface GrammarPointCardProps {
  point: GrammarPoint;
}

export function GrammarPointCard({ point }: GrammarPointCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleAiExplain = async () => {
    if (aiExplanation || isLoadingAi) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/ai/grammar-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pointId: point.id,
          title: point.title,
          level: point.level,
        }),
      });
      const data = (await res.json()) as { explanation?: string; error?: string };
      setAiExplanation(data.explanation ?? data.error ?? "Erreur lors de la génération.");
    } catch {
      setAiExplanation("Impossible de contacter Ollama. Vérifiez qu'il est démarré.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs shrink-0">
            {point.level}
          </Badge>
          <h3 className="font-medium text-sm">{point.title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 pb-4 px-4 space-y-4 border-t">
          {/* Explication */}
          <div className="mt-4">
            <p className="text-sm leading-relaxed text-gray-700">{point.explanation}</p>
          </div>

          {/* Exemples */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Exemples
            </h4>
            <div className="space-y-2">
              {point.examples.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm p-2 bg-blue-50 rounded-md"
                >
                  <span className="font-medium text-[#1A56DB] min-w-0 flex-1">
                    {ex.pt}
                  </span>
                  <span className="text-muted-foreground shrink-0">→</span>
                  <span className="text-gray-600 flex-1">{ex.fr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Astuce */}
          {point.tip && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              <span className="font-semibold">Astuce : </span>
              {point.tip}
            </div>
          )}

          {/* Bouton IA */}
          <div className="pt-1">
            {!aiExplanation ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiExplain}
                disabled={isLoadingAi}
                className="w-full"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                {isLoadingAi ? "Génération en cours..." : "Approfondir avec l'IA"}
              </Button>
            ) : (
              <div className="space-y-2">
                {isLoadingAi ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Explication IA (Ollama)
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {aiExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
