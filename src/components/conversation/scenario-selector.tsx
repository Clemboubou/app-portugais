"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScenarioSelectorProps {
  onStart: (scenario: string, level: string) => void;
}

type Level = "A1" | "A2" | "B1" | "B2";

const SCENARIOS: Record<Level, string[]> = {
  A1: ["Au café", "À l'hôtel", "Faire les courses", "Demander son chemin"],
  A2: ["À la gare", "Chez le médecin", "À la banque", "Visite touristique"],
  B1: [
    "Entretien d'embauche",
    "Discussion sur les actualités",
    "Planifier un voyage",
    "Louer un appartement",
  ],
  B2: [
    "Débat sur l'environnement",
    "Réunion professionnelle",
    "Critique d'un film",
    "Négociation",
  ],
};

const LEVEL_COLORS: Record<Level, string> = {
  A1: "bg-green-100 text-green-800 border-green-200",
  A2: "bg-blue-100 text-blue-800 border-blue-200",
  B1: "bg-orange-100 text-orange-800 border-orange-200",
  B2: "bg-purple-100 text-purple-800 border-purple-200",
};

export function ScenarioSelector({ onStart }: ScenarioSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<Level>("A1");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleStart = () => {
    if (!selectedScenario) return;
    onStart(selectedScenario, selectedLevel);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold mb-3">Choisir un niveau</h2>
        <div className="flex gap-2 flex-wrap">
          {(["A1", "A2", "B1", "B2"] as Level[]).map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedLevel(level);
                setSelectedScenario(null);
              }}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Choisir un scénario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIOS[selectedLevel].map((scenario) => (
            <Card
              key={scenario}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedScenario === scenario
                  ? "ring-2 ring-[#1A56DB] shadow-md"
                  : ""
              }`}
              onClick={() => setSelectedScenario(scenario)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">
                  {getScenarioEmoji(scenario)}
                </span>
                <div>
                  <p className="font-medium text-sm">{scenario}</p>
                  <Badge
                    variant="outline"
                    className={`text-xs mt-1 ${LEVEL_COLORS[selectedLevel]}`}
                  >
                    {selectedLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90"
        size="lg"
        disabled={!selectedScenario}
        onClick={handleStart}
      >
        Démarrer la conversation
      </Button>
    </div>
  );
}

function getScenarioEmoji(scenario: string): string {
  const emojis: Record<string, string> = {
    "Au café": "☕",
    "À l'hôtel": "🏨",
    "Faire les courses": "🛒",
    "Demander son chemin": "🗺️",
    "À la gare": "🚉",
    "Chez le médecin": "👨‍⚕️",
    "À la banque": "🏦",
    "Visite touristique": "📸",
    "Entretien d'embauche": "💼",
    "Discussion sur les actualités": "📰",
    "Planifier un voyage": "✈️",
    "Louer un appartement": "🏠",
    "Débat sur l'environnement": "🌿",
    "Réunion professionnelle": "📊",
    "Critique d'un film": "🎬",
    "Négociation": "🤝",
  };
  return emojis[scenario] ?? "💬";
}
