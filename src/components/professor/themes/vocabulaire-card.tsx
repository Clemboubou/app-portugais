"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import type { VocabulaireData } from "../types";

export function VocabulaireCard({ data }: { data: VocabulaireData }) {
  return (
    <div className="space-y-3">
      {/* Mot principal */}
      <div className="rounded-2xl border bg-emerald-50 dark:bg-emerald-950/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {data.word}
              </span>
              {data.gender && (
                <span className="text-xs font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-md">
                  {data.gender}
                </span>
              )}
              <AudioPlayer text={data.word} voice="female" className="h-7 w-7" />
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-mono">{data.ipa}</p>
            <p className="text-xs text-emerald-500 italic">{data.partOfSpeech}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-foreground leading-relaxed">{data.definition}</p>
      </div>

      {/* Mots associés */}
      {data.relatedWords && data.relatedWords.length > 0 && (
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Mots associés
          </p>
          <div className="flex flex-wrap gap-2">
            {data.relatedWords.map((w, i) => (
              <div key={i} className="flex items-center gap-1 rounded-xl bg-muted px-2.5 py-1">
                <span className="text-sm font-medium">{w}</span>
                <AudioPlayer text={w} voice="male" className="h-5 w-5" />
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
