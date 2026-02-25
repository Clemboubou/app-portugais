"use client";

import { useCallback, useState } from "react";
import {
  transcribe,
  isModelLoaded,
} from "@/lib/audio/whisper";

interface TranscriptionResult {
  text: string;
  confidence: number;
}

interface UseTranscriptionReturn {
  /** Lance la transcription d'un blob audio. */
  transcribe: (blob: Blob) => Promise<TranscriptionResult | null>;
  /** Vrai pendant la transcription. */
  isLoading: boolean;
  /** Vrai pendant le chargement initial du modèle. */
  isModelLoading: boolean;
  /** Progression du chargement du modèle (0-100). */
  progress: number;
  /** Résultat de la dernière transcription. */
  result: TranscriptionResult | null;
  /** Message d'erreur. */
  error: string | null;
}

/**
 * Hook de transcription vocale via Whisper (Transformers.js, navigateur).
 * Gère le chargement du modèle, la transcription, et les états.
 */
export function useTranscription(): UseTranscriptionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doTranscribe = useCallback(
    async (blob: Blob): Promise<TranscriptionResult | null> => {
      setError(null);
      setIsLoading(true);
      setResult(null);

      if (!isModelLoaded()) {
        setModelLoading(true);
        setProgress(0);
      }

      try {
        const transcriptionResult = await transcribe(blob, (p) => {
          if (p.progress !== undefined) {
            setProgress(Math.round(p.progress));
          }
          if (p.status === "ready") {
            setModelLoading(false);
            setProgress(100);
          }
        });

        setModelLoading(false);
        setResult(transcriptionResult);
        return transcriptionResult;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Erreur lors de la transcription.";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    transcribe: doTranscribe,
    isLoading,
    isModelLoading: modelLoading,
    progress,
    result,
    error,
  };
}
