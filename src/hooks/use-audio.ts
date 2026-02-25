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
 * Hook TTS avec deux niveaux :
 * 1. Serveur (WebSocket Microsoft → MP3 pt-PT-RaquelNeural)
 * 2. Fallback navigateur : window.speechSynthesis (pt-PT ou pt-BR)
 */
export function useAudio(): UseAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  /** Lecture via Web Speech API (fallback navigateur) */
  const playWithWebSpeech = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setError("Audio non disponible.");
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Chercher une voix pt-PT, sinon pt-BR, sinon la première disponible
      const voices = window.speechSynthesis.getVoices();
      const ptPT = voices.find((v) => v.lang === "pt-PT");
      const ptBR = voices.find((v) => v.lang === "pt-BR");
      const pt = voices.find((v) => v.lang.startsWith("pt"));
      utterance.voice = ptPT ?? ptBR ?? pt ?? null;
      utterance.lang = utterance.voice?.lang ?? "pt-PT";
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setError("Erreur lecture audio.");
      };

      setIsLoading(true);
      window.speechSynthesis.speak(utterance);
    },
    []
  );

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

          if (!response.ok) {
            // Fallback Web Speech sur erreur serveur
            playWithWebSpeech(text.trim());
            return;
          }

          const data = (await response.json()) as {
            audioUrl?: string;
            useWebSpeech?: boolean;
            error?: string;
          };

          // Le serveur indique d'utiliser le navigateur
          if (data.useWebSpeech) {
            playWithWebSpeech(text.trim());
            return;
          }

          if (!data.audioUrl) {
            playWithWebSpeech(text.trim());
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
          // Fallback si le fichier audio est corrompu
          playWithWebSpeech(text.trim());
        });

        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        setIsLoading(false);
        setIsPlaying(false);

        if (err instanceof DOMException && err.name === "AbortError") return;

        // Fallback Web Speech sur toute erreur réseau
        playWithWebSpeech(text.trim());
      }
    },
    [stop, playWithWebSpeech]
  );

  return { play, stop, isPlaying, isLoading, error };
}
