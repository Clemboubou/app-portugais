"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Award } from "lucide-react";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface ExamQuestion {
  id: string;
  competency: "CO" | "CE" | "PO" | "PE" | "IO";
  type: "mcq" | "fill_blank" | "translate" | "reorder";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface LevelExamProps {
  level: Level;
  questions: ExamQuestion[];
  onComplete: (passed: boolean, score: number, details: CompetencyScore[]) => void;
}

interface CompetencyScore {
  competency: string;
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

const COMPETENCY_LABELS: Record<string, string> = {
  CO: "Compréhension orale",
  CE: "Compréhension écrite",
  PO: "Production orale",
  PE: "Production écrite",
  IO: "Interaction orale",
};

const PASS_THRESHOLD = 0.7; // 70%

function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\.$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function LevelExam({ level, questions, onComplete }: LevelExamProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<
    Array<{ correct: boolean; competency: string }>
  >([]);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  const handleSubmit = () => {
    const given =
      question.type === "mcq" ? selectedOption ?? "" : userAnswer;
    const correct =
      normalizeAnswer(given) === normalizeAnswer(question.answer);

    setAnswers((prev) => [
      ...prev,
      { correct, competency: question.competency },
    ]);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setUserAnswer("");
    setSelectedOption(null);

    if (currentIdx + 1 >= questions.length) {
      // Calculer les résultats
      const allAnswers = [
        ...answers,
      ];

      // Score par compétence
      const competencyMap = new Map<string, { correct: number; total: number }>();
      for (const a of allAnswers) {
        const existing = competencyMap.get(a.competency) ?? { correct: 0, total: 0 };
        existing.total++;
        if (a.correct) existing.correct++;
        competencyMap.set(a.competency, existing);
      }

      const details: CompetencyScore[] = Array.from(
        competencyMap.entries()
      ).map(([comp, data]) => ({
        competency: comp,
        label: COMPETENCY_LABELS[comp] ?? comp,
        correct: data.correct,
        total: data.total,
        percentage: Math.round((data.correct / data.total) * 100),
      }));

      const totalCorrect = allAnswers.filter((a) => a.correct).length;
      const totalScore = Math.round(
        (totalCorrect / allAnswers.length) * 100
      );
      const passed = totalScore >= PASS_THRESHOLD * 100;

      setFinished(true);
      onComplete(passed, totalScore, details);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  if (finished) {
    const totalCorrect = answers.filter((a) => a.correct).length;
    const totalScore = Math.round((totalCorrect / answers.length) * 100);
    const passed = totalScore >= PASS_THRESHOLD * 100;

    // Regrouper par compétence
    const competencyMap = new Map<string, { correct: number; total: number }>();
    for (const a of answers) {
      const existing = competencyMap.get(a.competency) ?? { correct: 0, total: 0 };
      existing.total++;
      if (a.correct) existing.correct++;
      competencyMap.set(a.competency, existing);
    }

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            {passed ? (
              <Award className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-xl">
            {passed
              ? `Bravo ! Vous avez validé le niveau ${level} !`
              : `Le niveau ${level} n'est pas encore validé`}
          </CardTitle>
          <p className="text-muted-foreground mt-1">
            Score global : <span className="font-bold">{totalScore}%</span>
            {" "}(seuil : {PASS_THRESHOLD * 100}%)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Détail par compétence */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Détail par compétence :</h3>
            {Array.from(competencyMap.entries()).map(([comp, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={comp} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {COMPETENCY_LABELS[comp] ?? comp}
                    </span>
                    <span className="font-medium">
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 70
                          ? "bg-green-500"
                          : pct >= 50
                            ? "bg-orange-400"
                            : "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {!passed && (
            <p className="text-sm text-muted-foreground text-center pt-3 border-t">
              Continuez à pratiquer les leçons du niveau {level} pour
              améliorer vos compétences.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const isAnswerGiven =
    question.type === "mcq"
      ? selectedOption !== null
      : userAnswer.trim().length > 0;

  const lastAnswer = showFeedback ? answers[answers.length - 1] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progression */}
      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline">{level}</Badge>
        <span className="text-muted-foreground">
          Question {currentIdx + 1}/{questions.length}
        </span>
        <Badge variant="outline">
          {COMPETENCY_LABELS[question.competency] ?? question.competency}
        </Badge>
      </div>
      <Progress value={progress} className="h-1.5" />

      {/* Question */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p
            className="text-sm font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />

          {/* Options MCQ */}
          {question.type === "mcq" && question.options && (
            <div className="space-y-2">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                    showFeedback
                      ? normalizeAnswer(opt) ===
                        normalizeAnswer(question.answer)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                        : selectedOption === opt
                          ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                          : "border-gray-200 dark:border-gray-700"
                      : selectedOption === opt
                        ? "border-[#1A56DB] bg-blue-50 dark:bg-blue-950/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    if (!showFeedback) setSelectedOption(opt);
                  }}
                  disabled={showFeedback}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Input pour fill_blank / translate */}
          {(question.type === "fill_blank" ||
            question.type === "translate" ||
            question.type === "reorder") && (
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !showFeedback && isAnswerGiven) {
                  handleSubmit();
                }
              }}
              placeholder="Votre réponse..."
              disabled={showFeedback}
              className="text-sm"
            />
          )}

          {/* Feedback */}
          {showFeedback && lastAnswer && (
            <div
              className={`p-3 rounded-lg border text-sm ${
                lastAnswer.correct
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {lastAnswer.correct ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {lastAnswer.correct ? "Correct !" : "Incorrect"}
                </span>
              </div>
              {!lastAnswer.correct && (
                <p className="text-xs text-muted-foreground mb-1">
                  Réponse correcte : <strong>{question.answer}</strong>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end gap-2">
            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={!isAnswerGiven}
                className="bg-[#1A56DB] hover:bg-[#1A56DB]/90"
              >
                Valider
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIdx + 1 >= questions.length
                  ? "Voir les résultats"
                  : "Question suivante"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
