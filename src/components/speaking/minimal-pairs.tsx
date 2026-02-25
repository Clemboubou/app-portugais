"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio/audio-player";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { useTranscription } from "@/hooks/use-transcription";
import { calculateSimilarity } from "@/lib/audio/pronunciation";
import { ChevronRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import pairsData from "@/../content/speaking/minimal-pairs.json";

interface MinimalPair {
  id: string;
  sound1: string;
  sound2: string;
  word1: string;
  word2: string;
  translation1: string;
  translation2: string;
  level: string;
  tip: string;
}

const pairs: MinimalPair[] = pairsData.pairs;

export function MinimalPairs() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetWord, setTargetWord] = useState<"word1" | "word2" | null>(null);
  const [result, setResult] = useState<{ correct: boolean; transcribed: string } | null>(null);
  const { transcribe, isLoading, isModelLoading, progress } = useTranscription();

  const pair = pairs[currentIndex];

  function startExercise() {
    // Choisir aléatoirement quel mot prononcer
    const target = Math.random() < 0.5 ? "word1" : "word2";
    setTargetWord(target);
    setResult(null);
  }

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      if (!targetWord) return;
      const transcription = await transcribe(blob);
      if (transcription) {
        const target = targetWord === "word1" ? pair.word1 : pair.word2;
        const sim = calculateSimilarity(target, transcription.text);
        setResult({
          correct: sim >= 60,
          transcribed: transcription.text,
        });
      }
    },
    [transcribe, targetWord, pair]
  );

  function handleNext() {
    setTargetWord(null);
    setResult(null);
    setCurrentIndex((i) => (i + 1) % pairs.length);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Paires minimales</CardTitle>
            <Badge variant="secondary">
              {currentIndex + 1} / {pairs.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Les deux mots */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <p className="text-xl font-medium">{pair.word1}</p>
              <p className="text-sm text-muted-foreground">{pair.translation1}</p>
              <div className="flex justify-center mt-2">
                <AudioPlayer text={pair.word1} />
              </div>
              <Badge variant="outline" className="mt-1">{pair.sound1}</Badge>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-xl font-medium">{pair.word2}</p>
              <p className="text-sm text-muted-foreground">{pair.translation2}</p>
              <div className="flex justify-center mt-2">
                <AudioPlayer text={pair.word2} />
              </div>
              <Badge variant="outline" className="mt-1">{pair.sound2}</Badge>
            </div>
          </div>

          {/* Consigne */}
          {!targetWord && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Écoutez les deux mots, puis prononcez celui qui vous sera demandé.
              </p>
              <Button onClick={startExercise}>Commencer</Button>
            </div>
          )}

          {/* Exercice en cours */}
          {targetWord && !result && (
            <div className="space-y-3">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <p className="text-sm text-muted-foreground mb-1">Prononcez :</p>
                <p className="text-2xl font-bold text-primary">
                  {targetWord === "word1" ? pair.word1 : pair.word2}
                </p>
              </div>

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

              <AudioRecorder onRecordingComplete={handleRecordingComplete} maxDuration={5} />
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {result.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={result.correct ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {result.correct ? "Correct !" : "Pas tout à fait…"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vous avez dit : <span className="font-medium">&quot;{result.transcribed}&quot;</span>
              </p>
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">Conseil :</p>
                <p>{pair.tip}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={startExercise}>
                  Réessayer
                </Button>
                <Button variant="default" onClick={handleNext}>
                  Paire suivante <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
