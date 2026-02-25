"use client";

import { useEffect, useRef } from "react";
import { useRecorder } from "@/hooks/use-recorder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  /** Callback appelé quand l'enregistrement est terminé. */
  onRecordingComplete: (blob: Blob) => void;
  /** Durée maximale d'enregistrement en secondes (défaut : 60). */
  maxDuration?: number;
  /** Classes CSS supplémentaires. */
  className?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Composant d'enregistrement vocal.
 * Bouton micro toggle, indicateur d'enregistrement, timer, relecture.
 */
export function AudioRecorder({
  onRecordingComplete,
  maxDuration = 60,
  className,
}: AudioRecorderProps) {
  const { start, stop, isRecording, audioBlob, audioUrl, duration, error } =
    useRecorder();
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const callbackFired = useRef(false);

  // Auto-stop à la durée max
  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stop();
    }
  }, [isRecording, duration, maxDuration, stop]);

  // Callback quand le blob est prêt
  useEffect(() => {
    if (audioBlob && !callbackFired.current) {
      callbackFired.current = true;
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  function handleToggleRecording() {
    if (isRecording) {
      stop();
    } else {
      callbackFired.current = false;
      void start();
    }
  }

  function handlePlayback() {
    if (!audioUrl) return;

    if (playbackRef.current && !playbackRef.current.paused) {
      playbackRef.current.pause();
      playbackRef.current.currentTime = 0;
      playbackRef.current = null;
      return;
    }

    const audio = new Audio(audioUrl);
    playbackRef.current = audio;
    audio.addEventListener("ended", () => {
      playbackRef.current = null;
    });
    void audio.play();
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Bouton enregistrement */}
      <Button
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        onClick={handleToggleRecording}
        className="relative"
        aria-label={isRecording ? "Arrêter l'enregistrement" : "Enregistrer"}
      >
        {isRecording ? (
          <>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <Square className="h-5 w-5 mr-2" />
            Arrêter
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            Enregistrer
          </>
        )}
      </Button>

      {/* Timer */}
      {isRecording && (
        <Badge variant="secondary" className="tabular-nums text-base px-3 py-1">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </Badge>
      )}

      {/* Relecture */}
      {audioUrl && !isRecording && (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayback}
          aria-label="Réécouter l'enregistrement"
        >
          <Play className="h-4 w-4 mr-1" />
          Réécouter
        </Button>
      )}

      {/* Erreur */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
