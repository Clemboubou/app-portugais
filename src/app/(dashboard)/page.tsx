import { getDueCardsCount, getCompletedLessonIds, getTotalStudyTimeMinutes } from "@/lib/db/queries/srs";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  const dueCount = getDueCardsCount();
  const completedLessons = getCompletedLessonIds().length;
  const studyTimeMinutes = getTotalStudyTimeMinutes();

  return (
    <DashboardClient
      dueCount={dueCount}
      completedLessons={completedLessons}
      studyTimeMinutes={studyTimeMinutes}
    />
  );
}
