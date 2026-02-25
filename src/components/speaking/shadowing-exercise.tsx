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
import { Loader2, ChevronRight, Volume2 } from "lucide-react";
import type { PronunciationAnalysis } from "@/lib/audio/pronunciation";

interface ShadowingSentence {
  pt: string;
  fr: string;
  level: string;
}

const SENTENCES: ShadowingSentence[] = [
  { pt: "Bom dia, como está?", fr: "Bonjour, comment allez-vous ?", level: "A1" },
  { pt: "Eu chamo-me João.", fr: "Je m'appelle João.", level: "A1" },
  { pt: "Onde fica a estação de metro?", fr: "Où se trouve la station de métro ?", level: "A1" },
  { pt: "Gostava de um café, por favor.", fr: "J'aimerais un café, s'il vous plaît.", level: "A1" },
  { pt: "Quanto custa isto?", fr: "Combien ça coûte ?", level: "A1" },
  { pt: "O meu nome é Maria e sou de Lisboa.", fr: "Mon nom est Maria et je suis de Lisbonne.", level: "A1" },
  { pt: "Pode falar mais devagar, por favor?", fr: "Pouvez-vous parler plus lentement, s'il vous plaît ?", level: "A2" },
  { pt: "Ontem fui ao supermercado comprar fruta.", fr: "Hier je suis allé au supermarché acheter des fruits.", level: "A2" },
  { pt: "A que horas abre o museu?", fr: "À quelle heure ouvre le musée ?", level: "A2" },
  { pt: "Gostaria de reservar uma mesa para duas pessoas.", fr: "J'aimerais réserver une table pour deux personnes.", level: "B1" },
];

export function ShadowingExercise() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analysis, setAnalysis] = useState<PronunciationAnalysis | null>(null);
  const { transcribe, isLoading, isModelLoading, progress } = useTranscription();

  const sentence = SENTENCES[currentIndex];

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      const result = await transcribe(blob);
      if (result) {
        const a = analyzePronunciation(sentence.pt, result.text);
        setAnalysis(a);
      }
    },
    [transcribe, sentence.pt]
  );

  function handleRetry() {
    setAnalysis(null);
  }

  function handleNext() {
    setAnalysis(null);
    setCurrentIndex((i) => (i + 1) % SENTENCES.length);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Répétition guidée</CardTitle>
            <Badge variant="secondary">
              {currentIndex + 1} / {SENTENCES.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phrase à répéter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-lg font-medium">{sentence.pt}</p>
              <AudioPlayer text={sentence.pt} />
            </div>
            <p className="text-sm text-muted-foreground">{sentence.fr}</p>
            <Badge variant="outline">{sentence.level}</Badge>
          </div>

          {/* Instructions */}
          {!analysis && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                1. Écoutez la phrase avec le bouton <Volume2 className="inline h-4 w-4" />
                {" "}2. Enregistrez-vous en la répétant
              </p>

              {isModelLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement du modèle de reconnaissance vocale… {progress}%
                </div>
              )}

              {isLoading && !isModelLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transcription en cours…
                </div>
              )}

              <AudioRecorder onRecordingComplete={handleRecordingComplete} maxDuration={15} />
            </div>
          )}

          {/* Résultat */}
          {analysis && (
            <div className="space-y-4">
              <PronunciationFeedback analysis={analysis} onRetry={handleRetry} />
              <Button variant="outline" onClick={handleNext}>
                Phrase suivante <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
