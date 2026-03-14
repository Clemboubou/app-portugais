import { getOverviewStats } from "@/lib/db/queries/stats";
import { StatsOverview } from "@/components/stats/stats-overview";
import { SrsChart } from "@/components/stats/srs-chart";
import { RecentActivity } from "@/components/stats/recent-activity";
import { YearlyHeatmap } from "@/components/stats/yearly-heatmap";
import { SkillRadar } from "@/components/stats/skill-radar";
import { ExerciseTypeChart } from "@/components/stats/exercise-type-chart";
import { BarChart2 } from "lucide-react";

export default function StatsPage() {
  const stats = getOverviewStats();

  return (
    <div className="space-y-8">
      {/* Gradient header */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-violet-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <BarChart2 className="h-6 w-6 opacity-90" />
          <h1 className="text-2xl font-bold">Statistiques</h1>
        </div>
        <p className="text-violet-100 text-sm">
          Suivi de votre progression en portugais européen.
        </p>
      </div>

      {/* Vue d'ensemble */}
      <StatsOverview
        dueCards={stats.srs.dueCount}
        totalCards={stats.srs.totalCards}
        completedLessons={stats.lessons.completedCount}
        avgScore={stats.lessons.avgScore}
        totalTimeSeconds={stats.lessons.totalTimeSeconds}
        totalConversations={stats.conversations.totalCount}
        totalSessions={stats.sessions.totalSessions}
      />

      {/* Heatmap 365 jours */}
      <YearlyHeatmap
        data={stats.yearlyActivity.map((d) => ({
          date: d.date,
          count: d.count,
          items: d.items,
        }))}
      />

      {/* Compétences + réussite par type */}
      <div>
        <h2 className="text-base font-semibold mb-4">Compétences &amp; types d&apos;exercices</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SkillRadar skills={stats.skills} />
          <ExerciseTypeChart
            data={stats.exerciseTypes.map((e) => ({
              type: e.type,
              avgScore: e.avgScore,
              completions: e.completions,
            }))}
          />
        </div>
      </div>

      {/* SRS par état + performances */}
      <div>
        <h2 className="text-base font-semibold mb-4">Mémorisation &amp; performances</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SrsChart
            byState={stats.srs.byState}
            totalCards={stats.srs.totalCards}
            dueCount={stats.srs.dueCount}
          />

          <div className="rounded-2xl border bg-card shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-base">Performances</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Score moyen leçons</span>
                  <span className="font-bold text-[#1A56DB]">
                    {stats.lessons.avgScore > 0
                      ? `${stats.lessons.avgScore}%`
                      : "—"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1A56DB]"
                    style={{ width: `${stats.lessons.avgScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">
                    Score moyen conversations
                  </span>
                  <span className="font-bold text-purple-600">
                    {stats.conversations.avgScore !== null
                      ? `${stats.conversations.avgScore}%`
                      : "—"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-400"
                    style={{
                      width: `${stats.conversations.avgScore ?? 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                {[
                  {
                    label: "Leçons complétées",
                    value: stats.lessons.completedCount,
                  },
                  {
                    label: "Conversations",
                    value: stats.conversations.totalCount,
                  },
                  { label: "Cartes SRS", value: stats.srs.totalCards },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div>
        <h2 className="text-base font-semibold mb-4">Activité récente</h2>
        <RecentActivity
          recentLessons={stats.lessons.recentLessons.map((l) => ({
            lessonId: l.lessonId,
            score: l.score,
            completedAt: l.completedAt,
            timeSpentSeconds: l.timeSpentSeconds,
            title: l.title ?? null,
            type: l.type ?? null,
          }))}
          recentConversations={stats.conversations.recent.map((c) => ({
            id: c.id,
            scenario: c.scenario,
            level: c.level,
            startedAt: c.startedAt,
            score: c.score ?? null,
          }))}
          dailyActivity={stats.sessions.dailyActivity.map((d) => ({
            date: d.date,
            count: d.count,
            items: d.items,
          }))}
          sessionsByType={stats.sessions.byType.map((s) => ({
            sessionType: s.sessionType,
            count: s.count,
            totalItems: s.totalItems,
          }))}
        />
      </div>
    </div>
  );
}
