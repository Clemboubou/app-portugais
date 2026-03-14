"use client";

import { useState } from "react";
import { LevelSelector } from "@/components/level-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import cultureData from "@/../content/culture.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface CultureSection {
  id: string;
  title: string;
  level: string;
  category: string;
  content_fr: string;
  content_pt: string;
  key_vocabulary: { pt: string; fr: string }[];
  fun_fact: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  history: "🏛️",
  traditions: "🎉",
  gastronomy: "🍽️",
  music: "🎵",
  literature: "📚",
  daily_life: "🏠",
  geography: "🗺️",
  etiquette: "🤝",
};

const CATEGORY_LABELS: Record<string, string> = {
  history: "Histoire",
  traditions: "Traditions",
  gastronomy: "Gastronomie",
  music: "Musique",
  literature: "Littérature",
  daily_life: "Vie quotidienne",
  geography: "Géographie",
  etiquette: "Étiquette sociale",
};

export default function CulturePage() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPt, setShowPt] = useState(false);

  const sections = (cultureData.sections as CultureSection[]).filter(
    (s) => s.level === level
  );
  const current = sections.find((s) => s.id === selectedId);

  if (current) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedId(null); setShowPt(false); }}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <Badge variant="secondary">{current.level}</Badge>
          <Badge variant="outline">{CATEGORY_LABELS[current.category] ?? current.category}</Badge>
        </div>

        <h2 className="text-2xl font-bold">{current.title}</h2>

        <div className="flex gap-2">
          <Button
            variant={!showPt ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPt(false)}
          >
            Français
          </Button>
          <Button
            variant={showPt ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPt(true)}
          >
            Portugais
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="whitespace-pre-line leading-relaxed">
              {showPt ? current.content_pt : current.content_fr}
            </p>
          </CardContent>
        </Card>

        {current.key_vocabulary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vocabulaire clé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {current.key_vocabulary.map((v, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="font-medium text-primary">{v.pt}</span>
                    <span className="text-muted-foreground">— {v.fr}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {current.fun_fact && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="pt-6">
              <p className="text-sm">
                <span className="font-semibold">Le saviez-vous ?</span>{" "}
                {current.fun_fact}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Culture portugaise</h1>
          <p className="text-muted-foreground">
            Découvrez le Portugal : histoire, traditions, gastronomie, musique et plus.
          </p>
        </div>
        <LevelSelector selected={level} onChange={setLevel} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{sections.length} fiches</span>
        <span>·</span>
        <span>Niveau {level}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card
            key={section.id}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
            onClick={() => setSelectedId(section.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium leading-tight">
                  {section.title}
                </CardTitle>
                <span className="text-xl ml-2 shrink-0">
                  {CATEGORY_ICONS[section.category] ?? "🇵🇹"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[section.category] ?? section.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
