"use client";

import { useEffect, useState } from "react";
import { PlacementTest } from "@/components/placement/placement-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StoredResult {
  level: string;
  score: number;
  date: string;
  feedback?: string;
}

export default function PlacementPage() {
  const [storedResult, setStoredResult] = useState<StoredResult | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("placementResult");
    if (stored) {
      try {
        setStoredResult(JSON.parse(stored) as StoredResult);
      } catch {
        // Ignore
      }
    }
    setIsLoaded(true);
  }, []);

  const handleRestart = () => {
    localStorage.removeItem("placementResult");
    setStoredResult(null);
    setIsStarted(true);
  };

  if (!isLoaded) return null;

  if (storedResult && !isStarted) {
    const date = new Date(storedResult.date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Test de positionnement</h1>
          <p className="text-muted-foreground">
            Évaluez votre niveau de portugais européen.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Résultat précédent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Niveau détecté</p>
                <Badge className="text-xl px-5 py-2 mt-1 bg-[#1A56DB]">
                  {storedResult.level}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-3xl font-bold text-[#1A56DB]">{storedResult.score}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{date}</p>
              </div>
            </div>
            {storedResult.feedback && (
              <p className="text-sm text-muted-foreground border-t pt-3">
                {storedResult.feedback.substring(0, 200)}
                {storedResult.feedback.length > 200 ? "..." : ""}
              </p>
            )}
            <Button
              variant="outline"
              onClick={handleRestart}
              className="w-full"
            >
              Refaire le test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Test de positionnement</h1>
          <p className="text-muted-foreground">
            Évaluez votre niveau de portugais européen.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Ce test adaptatif évalue votre niveau selon le cadre CECRL (A1 → B2).
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Commence par 10 questions A1</li>
                <li>Si score ≥ 80%, passe au niveau suivant</li>
                <li>Maximum 40 questions (si vous êtes B2)</li>
                <li>Évaluation finale par IA (Ollama)</li>
              </ul>
            </div>
            <Button
              onClick={() => setIsStarted(true)}
              className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90"
              size="lg"
            >
              Commencer le test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Test de positionnement</h1>
        <p className="text-muted-foreground">
          Répondez à chaque question du mieux que vous pouvez.
        </p>
      </div>
      <PlacementTest />
    </div>
  );
}
