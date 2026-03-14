"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { TraductionData } from "../types";

export function TraductionCard({ data }: { data: TraductionData }) {
  return (
    <div className="space-y-3">
      {/* Phrase source */}
      <div className="rounded-2xl border bg-blue-50 dark:bg-blue-950/30 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">
          Français
        </p>
        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">{data.french}</p>
      </div>

      {/* Traductions par registre */}
      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Traductions en portugais européen
        </p>
        {data.translations.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-16 shrink-0">
              {t.register}
            </span>
            <span className="text-sm font-bold flex-1">{t.pt}</span>
            <AudioPlayer text={t.pt} voice="female" className="h-6 w-6 shrink-0" />
          </div>
        ))}
      </div>

      {/* Note optionnelle */}
      {data.note && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-4 py-2.5">
          <p className="text-xs text-blue-700 dark:text-blue-300 italic">💡 {data.note}</p>
        </div>
      )}

      {/* Exemples */}
      {data.examples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Exemples
          </p>
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1">
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
