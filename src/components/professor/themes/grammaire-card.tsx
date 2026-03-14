"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { GrammaireData } from "../types";

export function GrammaireCard({ data }: { data: GrammaireData }) {
  return (
    <div className="space-y-3">
      {/* Règle */}
      <div className="rounded-2xl border bg-amber-50 dark:bg-amber-950/30 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
          {data.title}
        </p>
        <p className="text-sm leading-relaxed text-foreground">{data.rule}</p>
      </div>

      {/* Comparaison optionnelle */}
      {data.comparison && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest">
                {data.comparison.leftLabel}
              </p>
              <ul className="space-y-1">
                {data.comparison.leftItems.map((item, i) => (
                  <li key={i} className="text-xs rounded-lg bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-blue-800 dark:text-blue-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-widest">
                {data.comparison.rightLabel}
              </p>
              <ul className="space-y-1">
                {data.comparison.rightItems.map((item, i) => (
                  <li key={i} className="text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-emerald-800 dark:text-emerald-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
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
            <div key={i} className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
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
