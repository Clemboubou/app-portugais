"use client";

import { useEffect, useState } from "react";
import { PlacementTest } from "@/components/placement/placement-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

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
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="h-6 w-6 opacity-90" />
            <h1 className="text-2xl font-bold">Test de positionnement</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Évaluez votre niveau de portugais européen selon le cadre CECRL.
          </p>
        </div>

        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Résultat précédent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Niveau détecté</p>
                <Badge className="rounded-full px-5 py-2 text-xl font-bold bg-[#1A56DB] hover:bg-[#1A56DB]/90">
                  {storedResult.level}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Score</p>
                <p className="text-3xl font-bold text-[#1A56DB]">{storedResult.score}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Date</p>
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
              className="w-full rounded-xl"
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
      <div className="space-y-8">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="h-6 w-6 opacity-90" />
            <h1 className="text-2xl font-bold">Test de positionnement</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Évaluez votre niveau de portugais européen selon le cadre CECRL.
          </p>
        </div>

        <Card className="rounded-2xl border bg-card shadow-sm">
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
              className="w-full rounded-xl bg-[#1A56DB] hover:bg-[#1A56DB]/90"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardList className="h-6 w-6 opacity-90" />
          <h1 className="text-2xl font-bold">Test de positionnement</h1>
        </div>
        <p className="text-blue-100 text-sm">
          Répondez à chaque question du mieux que vous pouvez.
        </p>
      </div>
      <PlacementTest />
    </div>
  );
}
