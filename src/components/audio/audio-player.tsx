"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { Volume2, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  /** Texte en portugais européen à synthétiser */
  text: string;
  /** Voix : "female" (Raquel, défaut) ou "male" (Duarte) */
  voice?: "female" | "male";
  /** Lancer la lecture automatiquement au montage du composant */
  autoPlay?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Bouton compact de lecture audio TTS (pt-PT).
 * Appelle POST /api/audio/tts, puis joue le MP3 retourné.
 */
export function AudioPlayer({
  text,
  voice = "female",
  autoPlay = false,
  className,
}: AudioPlayerProps) {
  const { play, stop, isPlaying, isLoading, error } = useAudio();
  const hasAutoPlayed = useRef(false);

  // Lancement automatique au premier rendu si autoPlay est activé
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      void play(text, voice);
    }
    // On veut uniquement réagir au montage du composant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    if (isPlaying) {
      stop();
    } else {
      void play(text, voice);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      title={
        isLoading
          ? "Génération de l'audio…"
          : isPlaying
          ? "Arrêter la lecture"
          : "Écouter la prononciation"
      }
      aria-label={
        isLoading
          ? "Génération de l'audio en cours"
          : isPlaying
          ? "Arrêter la lecture"
          : "Écouter la prononciation"
      }
      className={cn("shrink-0", className)}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : isPlaying ? (
        <Square className="h-4 w-4 text-primary" />
      ) : (
        <Volume2
          className={cn(
            "h-4 w-4",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        />
      )}
    </Button>
  );
}
