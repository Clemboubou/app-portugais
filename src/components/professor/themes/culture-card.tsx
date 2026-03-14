"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { CultureData } from "../types";

export function CultureCard({ data }: { data: CultureData }) {
  return (
    <div className="space-y-3">
      {/* Titre + contexte */}
      <div className="rounded-2xl border bg-orange-50 dark:bg-orange-950/30 p-4">
        <p className="text-base font-bold text-orange-700 dark:text-orange-300 mb-2">
          {data.title}
        </p>
        <p className="text-sm leading-relaxed text-foreground">{data.context}</p>
      </div>

      {/* Tableau d'usage optionnel */}
      {data.usageTable && data.usageTable.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Tableau d&apos;usage
          </p>
          <div className="space-y-1.5">
            {data.usageTable.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 px-3 py-2"
              >
                <span className="text-xs text-muted-foreground">{row.situation}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">{row.form}</span>
                  <AudioPlayer text={row.form} voice="male" className="h-5 w-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exemples */}
      {data.examples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Exemples
          </p>
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-3 space-y-1">
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
