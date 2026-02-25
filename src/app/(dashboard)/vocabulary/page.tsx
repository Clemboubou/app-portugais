"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio/audio-player";
import { ChevronLeft } from "lucide-react";

interface VocabItem {
  id: number;
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  tags: string;
}

const TAG_LABELS: Record<string, string> = {
  greetings: "Salutations",
  basics: "Bases",
  courtesy: "Politesse",
  identity: "Identité",
  nationality: "Nationalité",
  family: "Famille",
  numbers: "Nombres",
  time: "Temps",
  days: "Jours",
  months: "Mois",
  colors: "Couleurs",
  food: "Nourriture",
  drink: "Boissons",
  house: "Maison",
  furniture: "Mobilier",
  city: "Ville",
  transport: "Transports",
  shopping: "Courses",
  weather: "Météo",
  body: "Corps",
  clothing: "Vêtements",
  health: "Santé",
  work: "Travail",
  school: "École",
  nature: "Nature",
  animals: "Animaux",
  sports: "Sports",
  emotions: "Émotions",
  verbs: "Verbes",
  adjectives: "Adjectifs",
  travel: "Voyage",
  autre: "Autre",
};

const TAG_ICONS: Record<string, string> = {
  greetings: "👋",
  basics: "🔤",
  courtesy: "🤝",
  identity: "🪪",
  nationality: "🌍",
  family: "👨‍👩‍👧",
  numbers: "🔢",
  time: "⏰",
  days: "📅",
  months: "🗓️",
  colors: "🎨",
  food: "🍽️",
  drink: "🥤",
  house: "🏠",
  furniture: "🪑",
  city: "🏙️",
  transport: "🚌",
  shopping: "🛒",
  weather: "⛅",
  body: "🫀",
  clothing: "👕",
  health: "🏥",
  work: "💼",
  school: "📚",
  nature: "🌿",
  animals: "🐾",
  sports: "⚽",
  emotions: "💭",
  verbs: "⚡",
  adjectives: "✨",
  travel: "✈️",
  autre: "📦",
};

export default function VocabularyPage() {
  const [allVocab, setAllVocab] = useState<VocabItem[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vocabulary/all")
      .then((r) => r.json())
      .then((data: { items: VocabItem[] }) => {
        setAllVocab(data.items ?? []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Regrouper par premier tag
  const grouped = new Map<string, VocabItem[]>();
  for (const item of allVocab) {
    let tags: string[] = [];
    try { tags = JSON.parse(item.tags); } catch { tags = []; }
    const tag = tags[0] ?? "autre";
    if (!grouped.has(tag)) grouped.set(tag, []);
    grouped.get(tag)!.push(item);
  }

  const themes = Array.from(grouped.entries()).sort((a, b) =>
    (TAG_LABELS[a[0]] ?? a[0]).localeCompare(TAG_LABELS[b[0]] ?? b[0])
  );

  const currentItems = selectedTheme ? (grouped.get(selectedTheme) ?? []) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Vocabulaire</h1>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Vue détail d'un thème
  if (selectedTheme) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTheme(null)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Thèmes
          </Button>
          <h1 className="text-2xl font-bold">
            {TAG_ICONS[selectedTheme] ?? "📦"}{" "}
            {TAG_LABELS[selectedTheme] ?? selectedTheme}
          </h1>
          <Badge variant="secondary">{currentItems.length} mots</Badge>
        </div>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {currentItems.map((item) => (
            <Card key={item.id} className="transition-all hover:shadow-md hover:border-primary">
              <CardContent className="flex items-center gap-3 py-3">
                <AudioPlayer text={item.portuguese} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.portuguese}</p>
                  <p className="text-sm text-muted-foreground">{item.french}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-muted-foreground block">
                    [{item.phonetic}]
                  </span>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {item.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Vue grille des thèmes
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vocabulaire</h1>
        <p className="text-muted-foreground">
          {allVocab.length} mots — Choisissez un thème
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {themes.map(([tag, items]) => (
          <button
            key={tag}
            onClick={() => setSelectedTheme(tag)}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md hover:bg-primary/5 active:scale-95"
          >
            <span className="text-3xl">{TAG_ICONS[tag] ?? "📦"}</span>
            <span className="font-medium text-sm">
              {TAG_LABELS[tag] ?? tag}
            </span>
            <Badge variant="secondary" className="text-xs">
              {items.length} mots
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
