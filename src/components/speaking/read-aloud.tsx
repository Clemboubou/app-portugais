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
import { ChevronRight, Loader2 } from "lucide-react";
import type { PronunciationAnalysis } from "@/lib/audio/pronunciation";

interface ReadAloudSentence {
  pt: string;
  fr: string;
  level: string;
}

const SENTENCES: ReadAloudSentence[] = [
  { pt: "Lisboa é a capital de Portugal.", fr: "Lisbonne est la capitale du Portugal.", level: "A1" },
  { pt: "Eu gosto de comer pastéis de nata.", fr: "J'aime manger des pastéis de nata.", level: "A1" },
  { pt: "O comboio parte às nove horas da manhã.", fr: "Le train part à neuf heures du matin.", level: "A1" },
  { pt: "Amanhã vou visitar o castelo de São Jorge.", fr: "Demain je vais visiter le château de São Jorge.", level: "A2" },
  { pt: "A minha irmã trabalha num hospital em Coimbra.", fr: "Ma sœur travaille dans un hôpital à Coimbra.", level: "A2" },
  { pt: "Quando era criança, passava os verões no Algarve.", fr: "Quand j'étais enfant, je passais les étés en Algarve.", level: "B1" },
  { pt: "Gostaria de saber se ainda têm quartos disponíveis.", fr: "J'aimerais savoir si vous avez encore des chambres disponibles.", level: "B1" },
  { pt: "O fado é um género musical tradicional português.", fr: "Le fado est un genre musical traditionnel portugais.", level: "A2" },
  { pt: "Preciso de ir ao banco levantar dinheiro.", fr: "J'ai besoin d'aller à la banque retirer de l'argent.", level: "A2" },
  { pt: "Portugal tem um clima muito agradável durante todo o ano.", fr: "Le Portugal a un climat très agréable tout au long de l'année.", level: "B1" },
];

export function ReadAloud() {
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
            <CardTitle className="text-lg">Lecture à voix haute</CardTitle>
            <Badge variant="secondary">
              {currentIndex + 1} / {SENTENCES.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phrase à lire */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xl font-medium leading-relaxed">{sentence.pt}</p>
              <AudioPlayer text={sentence.pt} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{sentence.fr}</p>
            <Badge variant="outline" className="mt-2">{sentence.level}</Badge>
          </div>

          {/* Enregistrement */}
          {!analysis && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Lisez la phrase à voix haute, puis comparez votre prononciation.
              </p>

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
                Phrase suivante <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
