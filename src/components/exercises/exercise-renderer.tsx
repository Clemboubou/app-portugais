"use client";

import { ExerciseWrapper } from "./exercise-wrapper";
import { MultipleChoice } from "./multiple-choice";
import { FillInTheBlank } from "./fill-in-the-blank";
import { WordOrder } from "./word-order";
import { Translation } from "./translation";
import { ErrorDetection } from "./error-detection";
import { GuidedProduction } from "./guided-production";
import { Dictation } from "./dictation";
import { ShadowingInline } from "./shadowing-inline";
import { ListenAndAnswer } from "./listen-and-answer";
import { PronunciationInline } from "./pronunciation-inline";

interface Exercise {
  id: number;
  type: string;
  prompt: string;
  correctAnswer: string;
  distractorsJson: string | null;
  explanation: string;
}

interface ExerciseRendererProps {
  exercise: Exercise;
  onComplete: (isCorrect: boolean) => void;
}

export function ExerciseRenderer({
  exercise,
  onComplete,
}: ExerciseRendererProps) {
  const distractors: string[] = exercise.distractorsJson
    ? JSON.parse(exercise.distractorsJson)
    : [];

  return (
    <ExerciseWrapper
      prompt={exercise.prompt}
      explanation={exercise.explanation}
      onComplete={onComplete}
    >
      {({ onSubmit, isAnswered }) => {
        switch (exercise.type) {
          case "mcq":
            return (
              <MultipleChoice
                correctAnswer={exercise.correctAnswer}
                distractors={distractors}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "fill_blank":
            return (
              <FillInTheBlank
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "word_order":
            return (
              <WordOrder
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "translation":
            return (
              <Translation
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "error_detection":
            return (
              <ErrorDetection
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "guided_production":
            return (
              <GuidedProduction
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "dictation":
            return (
              <Dictation
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "transform":
            // Transform utilise le même composant que fill_blank
            return (
              <FillInTheBlank
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "shadowing":
            return (
              <ShadowingInline
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "listen_and_answer":
            return (
              <ListenAndAnswer
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          case "pronunciation":
            return (
              <PronunciationInline
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
          default:
            return (
              <FillInTheBlank
                correctAnswer={exercise.correctAnswer}
                onSubmit={onSubmit}
                isAnswered={isAnswered}
              />
            );
        }
      }}
    </ExerciseWrapper>
  );
}
