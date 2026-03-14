"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { ExpressionData } from "../types";

export function ExpressionCard({ data }: { data: ExpressionData }) {
  return (
    <div className="space-y-3">
      {/* Expression principale */}
      <div className="rounded-2xl border bg-rose-50 dark:bg-rose-950/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300 flex-1">
            {data.expression}
          </p>
          <AudioPlayer text={data.expression} voice="female" className="h-7 w-7 shrink-0" />
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 w-20 shrink-0 pt-0.5">
              Littéral
            </span>
            <p className="text-sm text-rose-700 dark:text-rose-300 italic">{data.literalMeaning}</p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 w-20 shrink-0 pt-0.5">
              Sens réel
            </span>
            <p className="text-sm font-semibold text-foreground">{data.realMeaning}</p>
          </div>
        </div>
      </div>

      {/* Contexte */}
      <div className="rounded-xl bg-muted/50 border px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Quand l&apos;utiliser
        </p>
        <p className="text-sm text-foreground">{data.context}</p>
      </div>

      {/* Exemples */}
      {data.examples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Exemples
          </p>
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 space-y-1">
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
