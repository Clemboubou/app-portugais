"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseRecorderReturn {
  /** Démarre l'enregistrement audio. */
  start: () => Promise<void>;
  /** Arrête l'enregistrement et retourne le blob. */
  stop: () => void;
  /** Vrai si le micro enregistre actuellement. */
  isRecording: boolean;
  /** Blob audio enregistré (null avant le premier enregistrement). */
  audioBlob: Blob | null;
  /** URL objet pour relecture (null avant le premier enregistrement). */
  audioUrl: string | null;
  /** Durée d'enregistrement en secondes. */
  duration: number;
  /** Message d'erreur (permission refusée, etc.). */
  error: string | null;
}

/**
 * Hook d'enregistrement vocal via MediaRecorder API.
 * Format : audio/webm;codecs=opus (support navigateur universel).
 */
export function useRecorder(): UseRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);

        // Arrêter le flux micro
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.start(250); // chunks toutes les 250ms
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Timer pour la durée
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres du navigateur.");
        } else if (err.name === "NotFoundError") {
          setError("Aucun microphone détecté.");
        } else {
          setError(`Erreur microphone : ${err.message}`);
        }
      } else {
        setError("Impossible d'accéder au microphone.");
      }
    }
  }, [audioUrl]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { start, stop, isRecording, audioBlob, audioUrl, duration, error };
}
