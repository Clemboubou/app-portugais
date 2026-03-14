"use client";

import { useState } from "react";
import { LevelSelector } from "@/components/level-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Volume2 } from "lucide-react";
import { AudioPlayer } from "@/components/audio/audio-player";
import phonologyData from "@/../content/phonology.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface PhonologyExample {
  word: string;
  ipa: string;
  meaning: string;
  note: string;
}

interface PhonologyItem {
  id: string;
  level: string;
  title: string;
  description: string;
  content: {
    rule: string;
    examples: PhonologyExample[];
    practice: string;
  };
}

export default function PronunciationPage() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = (phonologyData.phonology as PhonologyItem[]).filter(
    (p) => p.level === level
  );
  const current = items.find((p) => p.id === selectedId);

  if (current) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <Badge variant="secondary">{current.level}</Badge>
        </div>

        <div>
          <h2 className="text-2xl font-bold">{current.title}</h2>
          <p className="text-muted-foreground mt-1">{current.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Règle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{current.content.rule}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Exemples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {current.content.examples.map((ex, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-primary">
                    {ex.word}
                  </span>
                  <AudioPlayer text={ex.word} voice="male" className="h-7 w-7" />
                  <span className="font-mono text-sm text-muted-foreground">
                    {ex.ipa}
                  </span>
                  <span className="text-sm">— {ex.meaning}</span>
                </div>
                {ex.note && (
                  <p className="text-xs text-muted-foreground">{ex.note}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Volume2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-semibold">Exercice :</span>{" "}
                {current.content.practice}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prononciation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Maîtrisez la phonologie du portugais européen de Lisbonne.
          </p>
        </div>
        <LevelSelector selected={level} onChange={setLevel} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{items.length} modules</span>
        <span>·</span>
        <span>Niveau {level}</span>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Aucun module de prononciation pour ce niveau.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              onClick={() => setSelectedId(item.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-2 flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.content.examples.length} exemples
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
