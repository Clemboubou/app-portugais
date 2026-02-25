import Link from "next/link";
import { getAllModulesWithLessons } from "@/lib/db/queries/lessons";
import { getCompletedLessonIds } from "@/lib/db/queries/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  vocabulary: "Vocabulaire",
  grammar: "Grammaire",
  pronunciation: "Prononciation",
  conversation: "Conversation",
  listening: "Écoute",
  speaking: "Parler",
  reading: "Lecture",
  writing: "Écriture",
  cultural: "Culture",
};

export default function LessonsPage() {
  const modulesWithLessons = getAllModulesWithLessons();
  const completedIds = new Set(getCompletedLessonIds());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Leçons</h1>
        <p className="text-muted-foreground">
          Parcourez les modules et leçons par niveau.
        </p>
      </div>

      {modulesWithLessons.map((mod) => (
        <div key={mod.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge>{mod.levelCode}</Badge>
            <h2 className="text-lg font-semibold">{mod.title}</h2>
            <span className="text-sm text-muted-foreground">
              {mod.description}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {mod.lessons.map((lesson) => {
              const isCompleted = completedIds.has(lesson.id);

              return (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium">
                          {lesson.title}
                        </CardTitle>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABELS[lesson.type] ?? lesson.type}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lesson.estimatedMinutes} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
