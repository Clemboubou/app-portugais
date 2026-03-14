"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioVoice = "female" | "male";

interface UseAudioReturn {
  play: (text: string, voice?: AudioVoice) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook TTS — appelle POST /api/audio/tts (gTTS → edge-tts → WebSocket).
 * PAS de fallback Web Speech API : les voix navigateur Windows sont PT-BR,
 * ce qui causerait un mélange d'accents non souhaité.
 * Si le serveur TTS est indisponible, l'erreur est affichée (icône rouge).
 */
export function useAudio(): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const play = useCallback(
    async (text: string, voice: AudioVoice = "female") => {
      if (!text || text.trim().length === 0) return;

      stop();
      setError(null);

      const cacheKey = `${voice}::${text.trim()}`;

      try {
        let audioUrl = cacheRef.current.get(cacheKey);

        if (!audioUrl) {
          setIsLoading(true);

          abortRef.current = new AbortController();
          const response = await fetch("/api/audio/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text.trim(), voice }),
            signal: abortRef.current.signal,
          });

          const data = (await response.json()) as {
            audioUrl?: string;
            useWebSpeech?: boolean;
            error?: string;
          };

          if (!data.audioUrl) {
            // TTS indisponible — afficher erreur sans fallback PT-BR
            setError("TTS indisponible. Installez gTTS : pip install gTTS");
            setIsLoading(false);
            return;
          }

          audioUrl = data.audioUrl;
          cacheRef.current.set(cacheKey, audioUrl);
        }

        setIsLoading(false);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener("ended", () => setIsPlaying(false));
        audio.addEventListener("error", () => {
          setIsPlaying(false);
          setError("Erreur lecture audio.");
        });

        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        setIsLoading(false);
        setIsPlaying(false);

        if (err instanceof DOMException && err.name === "AbortError") return;

        setError("TTS indisponible.");
      }
    },
    [stop]
  );

  return { play, stop, isPlaying, isLoading, error };
}
