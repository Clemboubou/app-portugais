"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { SessionRecord } from "./anki-session";

interface AnkiHistoryProps {
  /** Lance une session ciblée sur les IDs donnés */
  onLaunch: (ids: number[]) => void;
}

const BASKET_LABELS: Record<string, string> = {
  "very-hard": "Très difficile",
  "hard": "Difficile",
  "good": "Bien",
  "easy": "Facile",
};

const LOCAL_STORAGE_KEY = "anki_history";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AnkiHistory({ onLaunch }: AnkiHistoryProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) setSessions(JSON.parse(stored) as SessionRecord[]);
    } catch {
      /* ignore */
    }
  }, []);

  function clearHistory() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch { /* ignore */ }
    setSessions([]);
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center space-y-2 text-muted-foreground">
        <p className="text-sm font-medium">Aucun historique</p>
        <p className="text-xs">
          Complétez une session Anki pour voir votre historique ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {sessions.length} session(s) sauvegardée(s)
        </p>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Effacer
        </button>
      </div>

      <div className="space-y-2">
        {sessions.map((s) => {
          const pct = s.total > 0 ? Math.round((s.good / s.total) * 100) : 0;
          const hasHard = s.hardVocabIds.length > 0;

          return (
            <div
              key={s.id}
              className="rounded-xl border bg-card p-4 flex items-center gap-3"
            >
              {/* Score circulaire */}
              <div className="shrink-0 text-center w-12">
                <p className={`text-lg font-bold leading-none ${pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-orange-500" : "text-red-500"}`}>
                  {pct}%
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">score</p>
              </div>

              {/* Détails */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium">{formatDate(s.date)}</span>
                  {s.basket && (
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                      {BASKET_LABELS[s.basket] ?? s.basket}
                    </span>
                  )}
                </div>
                <div className="flex gap-2.5 mt-1 text-[11px] text-muted-foreground">
                  <span>{s.total} cartes</span>
                  <span className="text-emerald-600">{s.good} bien</span>
                  <span className="text-red-500">{s.again} à revoir</span>
                </div>
              </div>

              {/* Bouton "Revoir les difficiles" */}
              {hasHard && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl shrink-0 text-[11px] h-8 gap-1 px-2"
                  onClick={() => onLaunch(s.hardVocabIds)}
                  title={`Revoir les ${s.hardVocabIds.length} mots difficiles de cette session`}
                >
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  {s.hardVocabIds.length} diff.
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
