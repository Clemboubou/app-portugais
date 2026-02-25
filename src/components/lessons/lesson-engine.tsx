"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StepContent } from "./step-content";
import { ExerciseRenderer } from "@/components/exercises/exercise-renderer";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

interface Step {
  type: string;
  title: string;
  content: string;
}

interface Exercise {
  id: number;
  type: string;
  prompt: string;
  correctAnswer: string;
  distractorsJson: string | null;
  explanation: string;
}

interface LessonData {
  id: number;
  title: string;
  type: string;
  estimatedMinutes: number;
  contentJson: string;
}

interface LessonEngineProps {
  lesson: LessonData;
  exercises: Exercise[];
}

const STEP_LABELS: Record<string, string> = {
  introduction: "Introduction",
  discovery: "Découverte",
  explanation: "Explication",
  practice: "Pratique",
  production: "Production",
};

export function LessonEngine({ lesson, exercises }: LessonEngineProps) {
  const content = JSON.parse(lesson.contentJson) as {
    objectives: string[];
    steps: Step[];
    vocabulary: Array<{ portuguese: string; phonetic: string; french: string }>;
  };

  const steps = content.steps;
  const totalSteps = steps.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTime = useRef(Date.now());

  const step = steps[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
  const isLastStep = currentStep === totalSteps - 1;
  const isPracticeStep = step?.type === "practice" || step?.type === "production";

  function handleNext() {
    if (isLastStep) {
      completeLesson();
    } else {
      setCurrentStep(currentStep + 1);
      setExerciseIndex(0);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleExerciseComplete(isCorrect: boolean) {
    if (isCorrect) setCorrectCount((c) => c + 1);

    if (exerciseIndex < exercises.length - 1) {
      setTimeout(() => setExerciseIndex(exerciseIndex + 1), 300);
    }
  }

  async function completeLesson() {
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    const score =
      exercises.length > 0 ? (correctCount / exercises.length) * 100 : 100;

    try {
      await fetch("/api/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          score,
          timeSpentSeconds: timeSpent,
        }),
      });
    } catch {
      // Continue even if save fails
    }

    setIsCompleted(true);
  }

  if (isCompleted) {
    const score =
      exercises.length > 0
        ? Math.round((correctCount / exercises.length) * 100)
        : 100;
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">Leçon terminée !</h2>
        <p className="text-lg text-muted-foreground">{lesson.title}</p>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{score}%</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">
                {correctCount}/{exercises.length}
              </p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
              <p className="text-sm text-muted-foreground">Temps</p>
            </CardContent>
          </Card>
        </div>

        <Button asChild>
          <a href="/lessons">Retour aux leçons</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          <Badge variant="outline">
            {currentStep + 1} / {totalSteps}
          </Badge>
        </div>
        <Progress value={progressPercent} />
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {STEP_LABELS[step.type] ?? step.type}
          </Badge>
          <span className="text-sm text-muted-foreground">
            ~{lesson.estimatedMinutes} min
          </span>
        </div>
      </div>

      {/* Contenu de l'étape */}
      <Card>
        <CardContent className="pt-6">
          {isPracticeStep && exercises.length > 0 ? (
            <div className="space-y-4">
              <StepContent title={step.title} content={step.content} />
              {exercises[exerciseIndex] && (
                <div className="mt-6 border-t pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Exercice {exerciseIndex + 1} / {exercises.length}
                  </p>
                  <ExerciseRenderer
                    key={exercises[exerciseIndex].id}
                    exercise={exercises[exerciseIndex]}
                    onComplete={handleExerciseComplete}
                  />
                </div>
              )}
            </div>
          ) : (
            <StepContent title={step.title} content={step.content} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Précédent
        </Button>
        <Button onClick={handleNext}>
          {isLastStep ? "Terminer" : "Continuer"}
          {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
