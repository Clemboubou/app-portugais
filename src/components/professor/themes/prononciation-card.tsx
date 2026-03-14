"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { PrononciationData } from "../types";

export function PrononciationCard({ data }: { data: PrononciationData }) {
  return (
    <div className="space-y-3">
      {/* Son principal */}
      <div className="rounded-2xl border bg-purple-50 dark:bg-purple-950/30 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/50">
            <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {data.sound}
            </span>
          </div>
          <div>
            <p className="text-xl font-mono font-bold text-purple-700 dark:text-purple-300">
              {data.ipa}
            </p>
            <p className="text-xs text-purple-500 mt-0.5">notation IPA</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{data.rule}</p>
      </div>

      {/* Exemples de mots */}
      {data.wordExamples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Exemples de mots
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {data.wordExamples.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{w.word}</p>
                  <p className="text-[10px] font-mono text-muted-foreground truncate">{w.ipa}</p>
                </div>
                <AudioPlayer text={w.word} voice="female" className="h-6 w-6 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exemples en phrase */}
      {data.examples.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Exemples en contexte
          </p>
          {data.examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-3 space-y-1">
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
