"use client";

import { useState, useCallback } from "react";
import { AudioPlayer } from "@/components/audio/audio-player";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { useTranscription } from "@/hooks/use-transcription";
import { calculateSimilarity } from "@/lib/audio/pronunciation";
import { Loader2 } from "lucide-react";

interface ShadowingInlineProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

export function ShadowingInline({
  correctAnswer,
  onSubmit,
  isAnswered,
}: ShadowingInlineProps) {
  const { transcribe, isLoading, isModelLoading, progress } = useTranscription();
  const [transcribed, setTranscribed] = useState("");

  const handleRecording = useCallback(
    async (blob: Blob) => {
      const result = await transcribe(blob);
      if (result) {
        setTranscribed(result.text);
        const score = calculateSimilarity(correctAnswer, result.text);
        onSubmit(score >= 60, result.text);
      }
    },
    [transcribe, correctAnswer, onSubmit]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Écoutez :</span>
        <AudioPlayer text={correctAnswer} />
        <span className="font-medium">{correctAnswer}</span>
      </div>

      {!isAnswered && (
        <div className="space-y-2">
          {isModelLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement du modèle… {progress}%
            </div>
          )}
          {isLoading && !isModelLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Transcription…
            </div>
          )}
          <AudioRecorder onRecordingComplete={handleRecording} maxDuration={15} />
        </div>
      )}

      {transcribed && (
        <p className="text-sm">
          Vous avez dit : <span className="font-medium">&quot;{transcribed}&quot;</span>
        </p>
      )}
    </div>
  );
}
