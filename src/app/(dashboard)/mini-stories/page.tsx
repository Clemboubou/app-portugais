"use client";

import { useState } from "react";
import { MiniStoryReader } from "@/components/mini-stories/mini-story-reader";
import storiesA1 from "@/../content/mini-stories/A1.json";
import storiesA2 from "@/../content/mini-stories/A2.json";
import storiesB1 from "@/../content/mini-stories/B1.json";
import { BookOpenText } from "lucide-react";

const LEVELS = [
  { code: "A1", label: "A1 — Débutant", data: storiesA1, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { code: "A2", label: "A2 — Élémentaire", data: storiesA2, color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
  { code: "B1", label: "B1 — Intermédiaire", data: storiesB1, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
];

export default function MiniStoriesPage() {
  const [selectedLevel, setSelectedLevel] = useState("A1");

  const currentLevel = LEVELS.find((l) => l.code === selectedLevel) ?? LEVELS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <BookOpenText className="h-6 w-6 opacity-90" />
          <h1 className="text-2xl font-bold">Mini-stories</h1>
        </div>
        <p className="text-emerald-100 text-sm">
          Petites histoires en portugais européen avec vocabulaire haute fréquence et répétitions.
          Chaque histoire existe en plusieurs versions : questions, passé, négatif.
        </p>
      </div>

      {/* Méthode */}
      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Comment utiliser les mini-stories ?</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Écoutez l&apos;histoire en entier (bouton audio)</li>
          <li>Lisez lentement en comprenant chaque phrase</li>
          <li>Passez à la version <strong>questions</strong> pour vérifier votre compréhension</li>
          <li>Lisez la version <strong>passé</strong> pour absorber les conjugaisons</li>
          <li>Répétez à voix haute en imitant l&apos;intonation (shadowing)</li>
        </ol>
      </div>

      {/* Sélecteur de niveau */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.code}
            onClick={() => setSelectedLevel(level.code)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedLevel === level.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {level.label}
            <span className="ml-2 text-xs opacity-70">
              {(level.data as { stories: unknown[] }).stories.length} histoires
            </span>
          </button>
        ))}
      </div>

      {/* Lecteur */}
      <MiniStoryReader
        key={selectedLevel}
        stories={(currentLevel.data as { stories: Parameters<typeof MiniStoryReader>[0]["stories"] }).stories}
        level={selectedLevel}
      />
    </div>
  );
}
