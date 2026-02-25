"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  type: "mcq" | "true_false";
  question: string;
  options?: string[];
  answer: number | boolean;
}

interface ReadingText {
  id: string;
  title: string;
  content: string;
  level: string;
  questions: Question[];
}

interface ReadingExerciseProps {
  text: ReadingText;
  onComplete: (score: number) => void;
}

export function ReadingExercise({ text, onComplete }: ReadingExerciseProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | boolean | null)[]>(
    Array(text.questions.length).fill(null)
  );
  const [showResult, setShowResult] = useState(false);
  const [showText, setShowText] = useState(true);

  const currentQuestion = text.questions[questionIndex];
  const currentAnswer = answers[questionIndex];

  const handleAnswer = (value: number | boolean) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (questionIndex < text.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const score = answers.filter((a, i) => {
    const q = text.questions[i];
    if (q.type === "mcq") return a === q.answer;
    if (q.type === "true_false") return a === q.answer;
    return false;
  }).length;

  if (showResult) {
    const scorePercent = Math.round((score / text.questions.length) * 100);
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-3xl font-bold text-[#1A56DB]">
              {score}/{text.questions.length}
            </p>
            <p className="text-muted-foreground text-sm">{scorePercent}% de bonnes réponses</p>
            <Button
              onClick={() => onComplete(scorePercent)}
              className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 mt-2"
            >
              Texte suivant
            </Button>
          </CardContent>
        </Card>

        {/* Révision des réponses */}
        <div className="space-y-3">
          {text.questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect =
              q.type === "mcq" ? userAnswer === q.answer : userAnswer === q.answer;
            return (
              <Card key={q.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                <CardContent className="pt-3 pb-3 px-4">
                  <p className="text-sm font-medium">
                    {isCorrect ? "✓" : "✗"} {q.question}
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Bonne réponse :{" "}
                      {q.type === "mcq"
                        ? q.options?.[q.answer as number]
                        : q.answer
                        ? "Vrai"
                        : "Faux"}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Texte */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{text.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{text.level}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowText(!showText)}
                className="text-xs"
              >
                {showText ? "Masquer" : "Afficher le texte"}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showText && (
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed font-mono text-gray-800">
              {text.content}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Question */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {questionIndex + 1}/{text.questions.length}
            </span>
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.type === "mcq" ? "Choix multiple" : "Vrai / Faux"}
            </Badge>
          </div>
          <CardTitle className="text-base font-medium mt-2">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentQuestion.type === "mcq" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    currentAnswer === i
                      ? "border-[#1A56DB] bg-blue-50 text-[#1A56DB] font-medium"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium mr-2 text-muted-foreground">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "true_false" && (
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => handleAnswer(val)}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    currentAnswer === val
                      ? "border-[#1A56DB] bg-blue-50 text-[#1A56DB]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {val ? "Vrai" : "Faux"}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleNext}
              disabled={currentAnswer === null}
              className="w-full bg-[#1A56DB] hover:bg-[#1A56DB]/90"
            >
              {questionIndex < text.questions.length - 1 ? "Question suivante" : "Voir les résultats"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
