"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/audio/audio-player";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { PronunciationFeedback } from "@/components/audio/pronunciation-feedback";
import { useTranscription } from "@/hooks/use-transcription";
import { analyzePronunciation } from "@/lib/audio/pronunciation";
import { ChevronRight, Loader2, Zap } from "lucide-react";
import type { PronunciationAnalysis } from "@/lib/audio/pronunciation";
import twistersData from "@/../content/speaking/tongue-twisters.json";

interface TongueTwister {
  id: string;
  text: string;
  translation: string;
  difficulty: number;
  level: string;
  focus: string;
  tip: string;
}

const twisters: TongueTwister[] = twistersData.twisters;

function getDifficultyLabel(d: number): string {
  if (d === 1) return "Facile";
  if (d === 2) return "Moyen";
  return "Difficile";
}

function getDifficultyColor(d: number): string {
  if (d === 1) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (d === 2) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
}

export function TongueTwisters() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
  const { transcribe, isLoading, isModelLoading, progress } = useTranscription();

  const twister = twisters[currentIndex];

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      const result = await transcribe(blob);
      if (result) {
        const a = analyzePronunciation(twister.text, result.text);
        setAnalysis(a);
      }
    },
    [transcribe, twister.text]
  );

  function handleRetry() {
    setAnalysis(null);
  }

  function handleNext() {
    setAnalysis(null);
    setCurrentIndex((i) => (i + 1) % twisters.length);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Virelangues
            </CardTitle>
            <Badge variant="secondary">
              {currentIndex + 1} / {twisters.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Virelangue */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-start justify-between gap-2">
              <p className="text-lg font-medium leading-relaxed italic">
                &quot;{twister.text}&quot;
              </p>
              <AudioPlayer text={twister.text} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{twister.translation}</p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">{twister.level}</Badge>
              <Badge className={getDifficultyColor(twister.difficulty)}>
                {getDifficultyLabel(twister.difficulty)}
              </Badge>
              <Badge variant="secondary">{twister.focus}</Badge>
            </div>
          </div>

          {/* Conseil */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Conseil :</p>
            <p className="text-blue-600 dark:text-blue-400">{twister.tip}</p>
          </div>

          {/* Enregistrement */}
          {!analysis && (
            <div className="space-y-3">
              {isModelLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement du modèle… {progress}%
                </div>
              )}

              {isLoading && !isModelLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transcription en cours…
                </div>
              )}

              <AudioRecorder onRecordingComplete={handleRecordingComplete} maxDuration={20} />
            </div>
          )}

          {/* Résultat */}
          {analysis && (
            <div className="space-y-4">
              <PronunciationFeedback analysis={analysis} onRetry={handleRetry} />
              <Button variant="outline" onClick={handleNext}>
                Virelangue suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
