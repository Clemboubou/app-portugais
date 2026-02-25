"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SrsStateEntry {
  state: number;
  count: number;
}

interface SrsChartProps {
  byState: SrsStateEntry[];
  totalCards: number;
  dueCount: number;
}

const STATE_LABELS: Record<number, string> = {
  0: "Nouvelles",
  1: "Apprentissage",
  2: "Révision",
  3: "Réapprentissage",
};

const STATE_COLORS: Record<number, string> = {
  0: "bg-gray-300",
  1: "bg-blue-400",
  2: "bg-green-500",
  3: "bg-orange-400",
};

const STATE_TEXT_COLORS: Record<number, string> = {
  0: "text-gray-600",
  1: "text-blue-600",
  2: "text-green-600",
  3: "text-orange-500",
};

export function SrsChart({ byState, totalCards, dueCount }: SrsChartProps) {
  const total = totalCards || 1; // Éviter division par zéro

  // Compléter les états manquants avec count=0
  const allStates = [0, 1, 2, 3].map((state) => ({
    state,
    count: byState.find((s) => s.state === state)?.count ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Cartes SRS par état</CardTitle>
          <Badge variant="outline" className="text-[#1A56DB]">
            {dueCount} dues aujourd&apos;hui
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre empilée */}
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          {allStates.map(({ state, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            if (pct < 1) return null;
            return (
              <div
                key={state}
                className={`${STATE_COLORS[state]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${STATE_LABELS[state]}: ${count}`}
              />
            );
          })}
          {totalCards === 0 && (
            <div className="bg-gray-100 w-full rounded-full" />
          )}
        </div>

        {/* Légende */}
        <div className="grid grid-cols-2 gap-2">
          {allStates.map(({ state, count }) => (
            <div key={state} className="flex items-center gap-2 text-sm">
              <div
                className={`h-3 w-3 rounded-sm shrink-0 ${STATE_COLORS[state]}`}
              />
              <span className="text-muted-foreground">{STATE_LABELS[state]}</span>
              <span className={`font-semibold ml-auto ${STATE_TEXT_COLORS[state]}`}>
                {count}
              </span>
            </div>
          ))}
        </div>

        {totalCards === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Aucune carte SRS créée. Commencez par le vocabulaire !
          </p>
        )}
      </CardContent>
    </Card>
  );
}
