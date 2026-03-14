"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Square, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerAdvancedProps {
  text: string;
  voice?: "female" | "male";
  className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25] as const;

/**
 * Lecteur audio avancé avec contrôle de vitesse, barre de progression,
 * et bouton rejouer.
 */
export function AudioPlayerAdvanced({
  text,
  voice = "female",
  className,
}: AudioPlayerAdvancedProps) {
  const { play, stop, isPlaying, isLoading } = useAudio();
  const [speedIndex, setSpeedIndex] = useState(2); // 1x par défaut
  const [progress, setProgress] = useState(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speed = SPEEDS[speedIndex];

  // Nettoyage
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      stop();
      setProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    await play(text, voice);

    // Après le démarrage, trouver l'élément audio actif et ajuster la vitesse
    // On utilise un court délai pour que l'audio soit créé
    setTimeout(() => {
      const audios = document.querySelectorAll("audio");
      const lastAudio = audios[audios.length - 1];
      if (lastAudio) {
        audioElementRef.current = lastAudio;
        lastAudio.playbackRate = speed;

        // Mettre à jour la progression
        progressIntervalRef.current = setInterval(() => {
          if (lastAudio.duration > 0) {
            setProgress((lastAudio.currentTime / lastAudio.duration) * 100);
          }
          if (lastAudio.ended) {
            setProgress(100);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          }
        }, 100);
      }
    }, 200);
  }, [isPlaying, play, stop, text, voice, speed]);

  function handleSpeedChange() {
    const newIndex = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(newIndex);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = SPEEDS[newIndex];
    }
  }

  function handleReplay() {
    setProgress(0);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      void audioElementRef.current.play();
    } else {
      void handlePlay();
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {/* Play / Stop */}
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="sm"
          onClick={handlePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : isPlaying ? (
            <Square className="h-4 w-4 mr-1" />
          ) : (
            <Volume2 className="h-4 w-4 mr-1" />
          )}
          {isPlaying ? "Stop" : "Écouter"}
        </Button>

        {/* Rejouer */}
        <Button variant="ghost" size="sm" onClick={handleReplay}>
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Vitesse */}
        <Badge
          variant="outline"
          className="cursor-pointer select-none"
          onClick={handleSpeedChange}
        >
          {speed}x
        </Badge>
      </div>

      {/* Barre de progression */}
      <div
        className="h-1.5 w-full rounded-full bg-muted overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (audioElementRef.current && audioElementRef.current.duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioElementRef.current.currentTime = ratio * audioElementRef.current.duration;
            setProgress(ratio * 100);
          }
        }}
      >
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
