"use client";

import { AudioPlayer } from "@/components/audio/audio-player";
import enhancements from "@/../content/vocabulary/enhancements.json";
import { Lightbulb } from "lucide-react";

interface Enhancement {
  portuguese: string;
  emoji?: string;
  mnemonic?: string;
}

const enhancementMap = new Map<string, Enhancement>(
  (enhancements as Enhancement[]).map((e) => [e.portuguese, e])
);

interface VocabItem {
  id: number;
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  tags: string;
  frequency: number;
}

interface AnkiCardProps {
  vocab: VocabItem;
  isNew: boolean;
  onReveal: () => void;
  revealed: boolean;
}

export function AnkiCard({ vocab, isNew, onReveal, revealed }: AnkiCardProps) {
  let tags: string[] = [];
  try {
    tags = JSON.parse(vocab.tags) as string[];
  } catch {
    tags = [];
  }

  const enhancement = enhancementMap.get(vocab.portuguese);
  const emoji = enhancement?.emoji;
  const mnemonic = enhancement?.mnemonic;

  return (
    <div className="relative w-full" style={{ perspective: "1200px" }}>
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "320px",
        }}
      >
        {/* ── Recto (Portugais) ── */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card shadow-md p-8 cursor-pointer"
          style={{ backfaceVisibility: "hidden" }}
          onClick={onReveal}
        >
          {isNew && (
            <span className="absolute top-4 left-4 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              Nouveau
            </span>
          )}
          <div className="text-center space-y-4">
            {emoji && (
              <p className="text-5xl" aria-hidden="true">{emoji}</p>
            )}
            <p className="text-4xl font-bold tracking-tight text-foreground">
              {vocab.portuguese}
            </p>
            <p className="text-lg text-muted-foreground font-mono">
              [{vocab.phonetic}]
            </p>
            <div onClick={(e) => e.stopPropagation()}>
              <AudioPlayer text={vocab.portuguese} voice="male" />
            </div>
          </div>
          <p className="absolute bottom-5 text-xs text-muted-foreground/50">
            Cliquez pour révéler
          </p>
        </div>

        {/* ── Verso (Français + détails) — cliquable pour re-flipper ── */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl border bg-card shadow-md p-8 cursor-pointer"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          onClick={onReveal}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {vocab.portuguese}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {vocab.french}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              [{vocab.phonetic}]
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {mnemonic && (
            <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {mnemonic}
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Niveau <span className="font-semibold text-foreground">{vocab.level}</span>
              {" · "}
              Fréquence <span className="font-semibold text-foreground">{vocab.frequency}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
