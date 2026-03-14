"use client";

import { useState } from "react";
import { LevelSelector } from "@/components/level-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, CheckCircle, Lightbulb } from "lucide-react";
import mistakesData from "@/../content/common-mistakes.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface Mistake {
  id: string;
  level: string;
  category: string;
  wrong: string;
  correct: string;
  explanation_fr: string;
  tip: string;
  frequency: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  false_friends: "Faux amis",
  grammar: "Grammaire",
  pronunciation: "Prononciation",
  vocabulary: "Vocabulaire",
  register: "Registre",
  syntax: "Syntaxe",
};

const FREQUENCY_COLORS: Record<string, string> = {
  very_common: "destructive",
  common: "secondary",
  occasional: "outline",
};

export default function CommonMistakesPage() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const allItems = (mistakesData.mistakes as Mistake[]).filter(
    (m) => m.level === level
  );

  const categories = Array.from(new Set(allItems.map((m) => m.category)));

  const items =
    selectedCategory === "all"
      ? allItems
      : allItems.filter((m) => m.category === selectedCategory);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Erreurs fréquentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Les pièges classiques des francophones qui apprennent le portugais européen.
          </p>
        </div>
        <LevelSelector selected={level} onChange={setLevel} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Toutes ({allItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat} (
            {allItems.filter((m) => m.category === cat).length})
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Aucune erreur répertoriée pour ce niveau.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((mistake) => (
            <Card key={mistake.id} className="rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium">
                    {CATEGORY_LABELS[mistake.category] ?? mistake.category}
                  </CardTitle>
                  <Badge
                    variant={
                      (FREQUENCY_COLORS[mistake.frequency] as
                        | "destructive"
                        | "secondary"
                        | "outline") ?? "outline"
                    }
                    className="text-xs shrink-0"
                  >
                    {mistake.frequency === "very_common"
                      ? "Très fréquent"
                      : mistake.frequency === "common"
                      ? "Fréquent"
                      : "Occasionnel"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm line-through text-muted-foreground">
                    {mistake.wrong}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    {mistake.correct}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {mistake.explanation_fr}
                </p>
                {mistake.tip && (
                  <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 p-2">
                    <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      {mistake.tip}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
