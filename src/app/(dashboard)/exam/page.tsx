"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelExam } from "@/components/exam/level-exam";
import { Award, ArrowRight } from "lucide-react";
import examsData from "@/../content/exam/exams.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface ExamResult {
  level: Level;
  passed: boolean;
  score: number;
  date: string;
}

const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  A1: "Valider vos bases : alphabet, présentations, chiffres, verbes essentiels.",
  A2: "Valider votre autonomie : passé, logement, santé, transports.",
  B1: "Valider votre niveau intermédiaire : subjonctif, conditionnel, culture.",
  B2: "Valider votre niveau avancé : argumentation, littérature, registres.",
  C1: "Valider votre maîtrise : mésoclise, registres formels, littérature, nuances.",
};

const NEXT_LEVEL: Record<Level, Level | null> = {
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: "C1",
  C1: null,
};

export default function ExamPage() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [examActive, setExamActive] = useState(false);
  const [results, setResults] = useState<ExamResult[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("examResults");
      return stored ? (JSON.parse(stored) as ExamResult[]) : [];
    } catch {
      return [];
    }
  });

  const handleComplete = (passed: boolean, score: number) => {
    if (!selectedLevel) return;
    const newResult: ExamResult = {
      level: selectedLevel,
      passed,
      score,
      date: new Date().toISOString(),
    };
    const updated = [...results.filter((r) => r.level !== selectedLevel), newResult];
    setResults(updated);
    localStorage.setItem("examResults", JSON.stringify(updated));
    setExamActive(false);
  };

  const getResultForLevel = (level: Level) =>
    results.find((r) => r.level === level);

  if (examActive && selectedLevel) {
    const rawQuestions =
      examsData[selectedLevel as keyof typeof examsData] ?? [];
    const questions = rawQuestions as Array<{
      id: string;
      competency: "CO" | "CE" | "PO" | "PE" | "IO";
      type: "mcq" | "fill_blank" | "translate" | "reorder";
      question: string;
      options?: string[];
      answer: string;
      explanation: string;
    }>;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Examen de validation — {selectedLevel}
            </h1>
            <p className="text-muted-foreground">
              {questions.length} questions · Seuil : 70%
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setExamActive(false);
              setSelectedLevel(null);
            }}
          >
            Abandonner
          </Button>
        </div>
        <LevelExam
          level={selectedLevel}
          questions={questions}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Examens de validation</h1>
        <p className="text-muted-foreground">
          Validez chaque niveau pour débloquer le suivant. 15 questions par
          examen, couvrant les 5 compétences CECRL.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(["A1", "A2", "B1", "B2", "C1"] as Level[]).map((level) => {
          const result = getResultForLevel(level);
          const isUnlocked = true; // Accès libre à tous les niveaux

          return (
            <Card
              key={level}
              className={`${
                !isUnlocked ? "opacity-50" : ""
              } ${result?.passed ? "border-green-300 dark:border-green-700" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge
                      variant={result?.passed ? "default" : "outline"}
                      className={
                        result?.passed
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {level}
                    </Badge>
                    {result?.passed && (
                      <Award className="h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {result && (
                    <span
                      className={`text-sm font-bold ${
                        result.passed ? "text-green-600" : "text-orange-500"
                      }`}
                    >
                      {result.score}%
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {LEVEL_DESCRIPTIONS[level]}
                </p>

                {result && (
                  <p className="text-xs text-muted-foreground">
                    Dernier passage :{" "}
                    {new Date(result.date).toLocaleDateString("fr-FR")}
                    {result.passed && NEXT_LEVEL[level] && (
                      <span className="flex items-center gap-1 mt-1 text-green-600">
                        <ArrowRight className="h-3 w-3" />
                        Niveau {NEXT_LEVEL[level]} débloqué
                      </span>
                    )}
                  </p>
                )}

                <Button
                  className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90"
                  onClick={() => {
                    setSelectedLevel(level);
                    setExamActive(true);
                  }}
                >
                  {result?.passed
                    ? "Repasser l'examen"
                    : "Passer l'examen"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
