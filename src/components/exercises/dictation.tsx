"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";

interface DictationProps {
  correctAnswer: string;
  onSubmit: (isCorrect: boolean, answer: string) => void;
  isAnswered: boolean;
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s+/g, " ");
}

export function Dictation({
  correctAnswer,
  onSubmit,
  isAnswered,
}: DictationProps) {
  const [answer, setAnswer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function playAudio() {
    setIsPlaying(true);
    try {
      if (!audioUrl) {
        const response = await fetch("/api/audio/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: correctAnswer }),
        });
        if (response.ok) {
          const data = await response.json();
          setAudioUrl(data.audioUrl);
          const audio = new Audio(data.audioUrl);
          audio.onended = () => setIsPlaying(false);
          audio.play();
          return;
        }
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        return;
      }
    } catch {
      // Silently fail
    }
    setIsPlaying(false);
  }

  function handleSubmit() {
    if (!answer.trim()) return;
    const isCorrect = normalize(answer) === normalize(correctAnswer);
    onSubmit(isCorrect, answer);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={playAudio}
          disabled={isPlaying}
          className="gap-2"
        >
          {isPlaying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
          Écouter
        </Button>
        <p className="text-sm text-muted-foreground">
          Écoutez et tapez ce que vous entendez
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez ce que vous entendez..."
          disabled={isAnswered}
        />
        {!isAnswered && (
          <Button onClick={handleSubmit} disabled={!answer.trim()}>
            Valider
          </Button>
        )}
      </div>
      {isAnswered && (
        <p className="text-sm text-green-600">
          Texte original : <strong>{correctAnswer}</strong>
        </p>
      )}
    </div>
  );
}
