"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { ConjugaisonData } from "../types";

export function ConjugaisonCard({ data }: { data: ConjugaisonData }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-2xl border bg-indigo-50 dark:bg-indigo-950/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {data.verb}
          </span>
          <span className="text-xs text-indigo-500">·</span>
          <span className="text-sm text-indigo-600 dark:text-indigo-400">{data.tense}</span>
          {data.isIrregular && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
              irrégulier
            </span>
          )}
        </div>
        {data.note && (
          <p className="text-xs text-indigo-500 dark:text-indigo-400 italic">{data.note}</p>
        )}
      </div>

      {/* Grille des formes */}
      <div className="rounded-2xl border bg-card p-4">
        <div className="grid grid-cols-2 gap-1.5">
          {data.forms.map((f) => (
            <div
              key={f.pronoun}
              className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 gap-2"
            >
              <span className="text-xs text-muted-foreground font-medium w-20 shrink-0">
                {f.pronoun}
              </span>
              <span className="text-sm font-bold text-foreground flex-1">{f.form}</span>
              <AudioPlayer text={f.form} voice="male" className="h-6 w-6 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Exemples */}
      {data.examples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Exemples
          </p>
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-indigo-50 dark:bg-indigo-950/30 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold flex-1">{ex.pt}</p>
                <AudioPlayer text={ex.pt} voice="female" className="h-6 w-6 shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground">{ex.fr}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
