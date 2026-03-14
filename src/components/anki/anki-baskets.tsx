"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw } from "lucide-react";

interface BasketCounts {
  veryHard: number;
  hard: number;
  good: number;
  easy: number;
}

interface AnkiBasketsProps {
  onLaunch: (basket: string) => void;
}

const BASKETS = [
  {
    key: "very-hard",
    label: "Très difficile",
    description: "Cartes en réapprentissage ou avec ≥ 3 échecs",
    cardStyle: "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900",
    badge: "bg-red-500 text-white",
    countStyle: "text-red-600 dark:text-red-400",
    countKey: "veryHard" as const,
  },
  {
    key: "hard",
    label: "Difficile",
    description: "Cartes en phase d'apprentissage initiale",
    cardStyle: "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900",
    badge: "bg-orange-500 text-white",
    countStyle: "text-orange-600 dark:text-orange-400",
    countKey: "hard" as const,
  },
  {
    key: "good",
    label: "Bien",
    description: "En révision, intervalle < 2 semaines",
    cardStyle: "border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900",
    badge: "bg-blue-500 text-white",
    countStyle: "text-blue-600 dark:text-blue-400",
    countKey: "good" as const,
  },
  {
    key: "easy",
    label: "Facile",
    description: "Cartes maîtrisées, intervalle ≥ 2 semaines",
    cardStyle: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900",
    badge: "bg-emerald-500 text-white",
    countStyle: "text-emerald-600 dark:text-emerald-400",
    countKey: "easy" as const,
  },
] as const;

export function AnkiBaskets({ onLaunch }: AnkiBasketsProps) {
  const [counts, setCounts] = useState<BasketCounts | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = () => {
    setLoading(true);
    void fetch("/api/anki/baskets")
      .then((r) => r.json())
      .then((data) => setCounts(data as BasketCounts))
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Révisez les mots par niveau de difficulté FSRS, indépendamment des intervalles planifiés.
        </p>
        <button
          onClick={fetchCounts}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BASKETS.map((b) => {
          const count = counts?.[b.countKey] ?? 0;
          return (
            <div
              key={b.key}
              className={`rounded-2xl border p-4 space-y-3 ${b.cardStyle}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.badge}`}>
                  {b.label}
                </span>
                <span className={`text-2xl font-bold leading-none ${b.countStyle}`}>
                  {loading ? "—" : count}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {b.description}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-xl text-xs h-8"
                disabled={loading || count === 0}
                onClick={() => onLaunch(b.key)}
              >
                <Play className="h-3 w-3 mr-1.5" />
                Réviser
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center pt-1">
        Les paniers reflètent l&apos;état FSRS actuel — ils évoluent au fil de vos révisions.
      </p>
    </div>
  );
}
