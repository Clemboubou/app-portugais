"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import questionsData from "@/../content/placement/questions.json";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface PlacementQuestion {
  id: string;
  level: Level;
  type: "mcq" | "fill_blank" | "translation";
  question: string;
  options?: string[];
  answer: string;
}

interface AnswerRecord {
  questionId: string;
  given: string;
  correct: string;
}

interface PlacementResult {
  detectedLevel: string;
  score: number;
  feedback: string;
}

const ALL_QUESTIONS = questionsData.questions as PlacementQuestion[];
const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];
const PASS_THRESHOLD = 0.8; // 80%

function getQuestionsForLevel(level: Level): PlacementQuestion[] {
  return ALL_QUESTIONS.filter((q) => q.level === level);
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\.$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isCorrect(given: string, correct: string): boolean {
  return normalizeAnswer(given) === normalizeAnswer(correct);
}

export function PlacementTest() {
  const [currentLevel, setCurrentLevel] = useState<Level>("A1");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [levelAnswers, setLevelAnswers] = useState<AnswerRecord[]>([]);
  const [allAnswers, setAllAnswers] = useState<AnswerRecord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [inputAnswer, setInputAnswer] = useState<string>("");
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const levelQuestions = getQuestionsForLevel(currentLevel);
  const currentQuestion = levelQuestions[currentQuestionIndex];


  const getCurrentAnswer = (): string => {
    if (currentQuestion.type === "mcq") return selectedAnswer;
    return inputAnswer;
  };

  const handleSubmitAnswer = () => {
    const given = getCurrentAnswer();
    if (!given.trim() && currentQuestion.type !== "mcq") return;
    if (currentQuestion.type === "mcq" && !given) return;

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      given: given.trim(),
      correct: currentQuestion.answer,
    };

    const newLevelAnswers = [...levelAnswers, record];
    const newAllAnswers = [...allAnswers, record];

    setSelectedAnswer("");
    setInputAnswer("");

    if (currentQuestionIndex < levelQuestions.length - 1) {
      // Question suivante du même niveau
      setLevelAnswers(newLevelAnswers);
      setAllAnswers(newAllAnswers);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Fin du niveau — calculer le score
      const correctCount = newLevelAnswers.filter((a) => isCorrect(a.given, a.correct)).length;
      const score = correctCount / levelQuestions.length;
      const currentLevelIdx = LEVELS.indexOf(currentLevel);

      if (score >= PASS_THRESHOLD && currentLevelIdx < LEVELS.length - 1) {
        // Niveau suivant
        const nextLevel = LEVELS[currentLevelIdx + 1];
        setCurrentLevel(nextLevel);
        setCurrentQuestionIndex(0);
        setLevelAnswers([]);
        setAllAnswers(newAllAnswers);
      } else {
        // S'arrêter ici
        setAllAnswers(newAllAnswers);
        setIsFinished(true);
        evaluateResults(newAllAnswers, currentLevel);
      }
    }
  };

  const evaluateResults = async (answers: AnswerRecord[], level: Level) => {
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/ai/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, level }),
      });
      const data = (await res.json()) as PlacementResult;
      setResult(data);
      // Sauvegarder dans localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "placementResult",
          JSON.stringify({
            level: data.detectedLevel,
            score: data.score,
            feedback: data.feedback,
            date: new Date().toISOString(),
          })
        );
      }
    } catch {
      // Fallback sans Ollama
      const correctCount = answers.filter((a) => isCorrect(a.given, a.correct)).length;
      const score = Math.round((correctCount / answers.length) * 100);
      const fallbackResult: PlacementResult = {
        detectedLevel: level,
        score,
        feedback: `Vous avez obtenu ${score}% de bonnes réponses. Niveau détecté : ${level}. Continuez à pratiquer avec les leçons correspondantes.`,
      };
      setResult(fallbackResult);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "placementResult",
          JSON.stringify({
            level,
            score,
            date: new Date().toISOString(),
          })
        );
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isFinished) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-center">Résultat du test</h2>

        {isEvaluating ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <p className="text-center text-sm text-muted-foreground">
              Analyse en cours avec Ollama...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <Card className="text-center">
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-muted-foreground">Niveau détecté</p>
                <Badge className="text-2xl px-6 py-2 bg-[#1A56DB]">
                  {result.detectedLevel}
                </Badge>
                <p className="text-3xl font-bold text-[#1A56DB] mt-2">{result.score}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.feedback}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            Niveau en cours :
            <Badge variant="outline">{currentLevel}</Badge>
          </span>
          <span>
            Question {currentQuestionIndex + 1}/{levelQuestions.length}
          </span>
        </div>
        <Progress value={((currentQuestionIndex) / levelQuestions.length) * 100} className="h-2" />
        <div className="flex gap-1">
          {LEVELS.map((l) => (
            <div
              key={l}
              className={`flex-1 h-1 rounded-full ${
                LEVELS.indexOf(l) < LEVELS.indexOf(currentLevel)
                  ? "bg-green-500"
                  : LEVELS.indexOf(l) === LEVELS.indexOf(currentLevel)
                  ? "bg-[#1A56DB]"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.type === "mcq"
                ? "Choix multiple"
                : currentQuestion.type === "fill_blank"
                ? "Compléter"
                : "Traduction"}
            </Badge>
            <Badge variant="outline" className="text-xs">{currentLevel}</Badge>
          </div>
          <CardTitle className="text-base font-medium mt-2">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.type === "mcq" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    selectedAnswer === opt
                      ? "border-[#1A56DB] bg-blue-50 text-[#1A56DB] font-medium"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(currentQuestion.type === "fill_blank" ||
            currentQuestion.type === "translation") && (
            <Input
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              placeholder="Votre réponse..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmitAnswer();
              }}
              className="w-full"
            />
          )}

          <Button
            onClick={handleSubmitAnswer}
            disabled={
              (currentQuestion.type === "mcq" && !selectedAnswer) ||
              (currentQuestion.type !== "mcq" && !inputAnswer.trim())
            }
            className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90"
          >
            Valider
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
