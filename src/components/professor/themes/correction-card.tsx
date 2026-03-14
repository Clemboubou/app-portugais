"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import { X, Check } from "lucide-react";
import type { CorrectionData } from "../types";

export function CorrectionCard({ data }: { data: CorrectionData }) {
  return (
    <div className="space-y-3">
      {/* Erreur → Correction */}
      <div className="rounded-2xl border bg-card p-4 space-y-2">
        {/* Mauvaise forme */}
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 px-3 py-2.5">
          <X className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm line-through text-red-600 dark:text-red-400 flex-1">{data.wrong}</p>
        </div>
        {/* Forme correcte */}
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 px-3 py-2.5">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex-1">
            {data.correct}
          </p>
          <AudioPlayer text={data.correct} voice="female" className="h-6 w-6 shrink-0" />
        </div>
      </div>

      {/* Règle + explication */}
      <div className="rounded-2xl border bg-amber-50 dark:bg-amber-950/30 p-4">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">{data.rule}</p>
        <p className="text-sm leading-relaxed text-foreground">{data.explanation}</p>
      </div>

      {/* Exemples */}
      {data.examples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Autres exemples corrects
          </p>
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-1">
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
