import { notFound } from "next/navigation";
import Link from "next/link";
import { getLessonById, getExercisesByLesson } from "@/lib/db/queries/lessons";
import { LessonEngine } from "@/components/lessons/lesson-engine";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface LessonPageProps {
  params: { id: string };
}

export default function LessonPage({ params }: LessonPageProps) {
  const lessonId = parseInt(params.id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const lesson = getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  const exercises = getExercisesByLesson(lessonId);

  return (
    <div className="space-y-4">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/lessons">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Retour aux leçons
          </Link>
        </Button>
      </div>

      <LessonEngine
        lesson={{
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          estimatedMinutes: lesson.estimatedMinutes,
          contentJson: lesson.contentJson,
        }}
        exercises={exercises.map((ex) => ({
          id: ex.id,
          type: ex.type,
          prompt: ex.prompt,
          correctAnswer: ex.correctAnswer,
          distractorsJson: ex.distractorsJson,
          explanation: ex.explanation,
        }))}
      />
    </div>
  );
}
