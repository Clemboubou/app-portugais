"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio/audio-player";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  portuguese: string;
  phonetic: string;
  french: string;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

export function Flashcard({
  portuguese,
  phonetic,
  french,
  onFlip,
  className,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  function handleFlip() {
    const next = !isFlipped;
    setIsFlipped(next);
    onFlip?.(next);
  }

  return (
    <div
      className={cn("perspective-1000 cursor-pointer", className)}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleFlip();
        }
      }}
      aria-label={isFlipped ? "Cliquer pour voir le mot portugais" : "Cliquer pour voir la traduction"}
    >
      <div
        className={cn(
          "relative transition-transform duration-500 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Face avant — Portugais */}
        <Card className="min-h-[200px] [backface-visibility:hidden]">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 pt-6">
            <p className="text-3xl font-bold">{portuguese}</p>
            <p className="text-lg text-muted-foreground">[{phonetic}]</p>
            <div onClick={(e) => e.stopPropagation()}>
              <AudioPlayer text={portuguese} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Cliquer pour retourner
            </p>
          </CardContent>
        </Card>

        {/* Face arrière — Français */}
        <Card className="absolute inset-0 min-h-[200px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 pt-6">
            <p className="text-2xl font-semibold text-primary">{french}</p>
            <p className="text-lg text-muted-foreground">{portuguese}</p>
            <p className="text-sm text-muted-foreground">[{phonetic}]</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
