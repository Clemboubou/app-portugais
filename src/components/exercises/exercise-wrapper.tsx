"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface ExerciseWrapperProps {
  prompt: string;
  explanation: string;
  children: (props: {
    onSubmit: (isCorrect: boolean, answer: string) => void;
    isAnswered: boolean;
  }) => React.ReactNode;
  onComplete: (isCorrect: boolean) => void;
}

export function ExerciseWrapper({
  prompt,
  explanation,
  children,
  onComplete,
}: ExerciseWrapperProps) {
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function handleSubmit(correct: boolean) {
    setIsCorrect(correct);
    setIsAnswered(true);
  }

  function handleContinue() {
    onComplete(isCorrect);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="text-base font-medium"
          dangerouslySetInnerHTML={{ __html: prompt }}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {children({ onSubmit: handleSubmit, isAnswered })}

        {isAnswered && (
          <div
            className={`rounded-lg border p-4 ${
              isCorrect
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    Correct
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <Badge variant="outline" className="border-red-600 text-red-600">
                    Incorrect
                  </Badge>
                </>
              )}
            </div>
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: explanation }}
            />
          </div>
        )}

        {isAnswered && (
          <div className="flex justify-end">
            <Button onClick={handleContinue}>Continuer</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
