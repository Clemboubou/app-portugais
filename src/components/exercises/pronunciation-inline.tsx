"use client";

import { useState, useCallback } from "react";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { useTranscription } from "@/hooks/use-transcription";
import { calculateSimilarity } from "@/lib/audio/pronunciation";
import { Loader2 } from "lucide-react";

interface PronunciationInlineProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

/**
 * Exercice de prononciation simplifié intégré au LessonEngine.
 * Affiche le texte, l'apprenant le lit à voix haute, Whisper transcrit.
 */
export function PronunciationInline({
  correctAnswer,
  onSubmit,
  isAnswered,
}: PronunciationInlineProps) {
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
      <div className="p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground mb-1">Lisez à voix haute :</p>
        <p className="text-lg font-medium">{correctAnswer}</p>
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
          Reconnu : <span className="font-medium">&quot;{transcribed}&quot;</span>
        </p>
      )}
    </div>
  );
}
