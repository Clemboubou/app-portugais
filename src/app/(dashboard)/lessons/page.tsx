import { getAllModulesWithLessons } from "@/lib/db/queries/lessons";
import { getCompletedLessonIds } from "@/lib/db/queries/progress";
import { LessonsFilter } from "@/components/lessons/lessons-filter";

export default function LessonsPage() {
  const modulesWithLessons = getAllModulesWithLessons();
  const completedIds = new Set(getCompletedLessonIds());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leçons</h1>
        <p className="text-muted-foreground">
          Parcourez les modules et leçons par niveau.
        </p>
      </div>

      <LessonsFilter modules={modulesWithLessons} completedIds={completedIds} />
    </div>
  );
}
