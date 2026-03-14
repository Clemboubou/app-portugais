"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, ChevronRight, BookOpen } from "lucide-react";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

const LEVEL_STYLES: Record<Level, { pill: string; badge: string; border: string; dot: string }> = {
  A1: {
    pill:   "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900",
    badge:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    dot:    "bg-emerald-500",
  },
  A2: {
    pill:   "bg-blue-500 text-white shadow-blue-200 dark:shadow-blue-900",
    badge:  "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
    border: "border-blue-200/60 dark:border-blue-800/40",
    dot:    "bg-blue-500",
  },
  B1: {
    pill:   "bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-900",
    badge:  "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    border: "border-amber-200/60 dark:border-amber-800/40",
    dot:    "bg-amber-500",
  },
  B2: {
    pill:   "bg-violet-500 text-white shadow-violet-200 dark:shadow-violet-900",
    badge:  "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400",
    border: "border-violet-200/60 dark:border-violet-800/40",
    dot:    "bg-violet-500",
  },
  C1: {
    pill:   "bg-rose-500 text-white shadow-rose-200 dark:shadow-rose-900",
    badge:  "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
    border: "border-rose-200/60 dark:border-rose-800/40",
    dot:    "bg-rose-500",
  },
};

const TYPE_LABELS: Record<string, string> = {
  vocabulary:    "Vocabulaire",
  grammar:       "Grammaire",
  pronunciation: "Prononciation",
  conversation:  "Conversation",
  listening:     "Écoute",
  speaking:      "Parler",
  reading:       "Lecture",
  writing:       "Écriture",
  cultural:      "Culture",
};

interface Lesson {
  id: number;
  title: string;
  type: string;
  estimatedMinutes: number | null;
}

interface ModuleWithLessons {
  id: number;
  title: string;
  description: string | null;
  levelCode: string;
  lessons: (Lesson | null)[];
}

interface LessonsFilterProps {
  modules: ModuleWithLessons[];
  completedIds: Set<number>;
}

export function LessonsFilter({ modules, completedIds }: LessonsFilterProps) {
  const [activeLevel, setActiveLevel] = useState<Level | "all">("all");

  const filtered =
    activeLevel === "all"
      ? modules
      : modules.filter((m) => m.levelCode === activeLevel);

  const countByLevel = (level: Level) =>
    modules
      .filter((m) => m.levelCode === level)
      .reduce((acc, m) => acc + m.lessons.filter(Boolean).length, 0);

  return (
    <div className="space-y-8">

      {/* ── Filtres niveau ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveLevel("all")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 border",
            activeLevel === "all"
              ? "bg-foreground text-background shadow-sm border-transparent"
              : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
          )}
        >
          Tous
          <span className="ml-1.5 text-xs opacity-60">
            ({modules.reduce((a, m) => a + m.lessons.filter(Boolean).length, 0)})
          </span>
        </button>

        {LEVELS.map((level) => {
          const s = LEVEL_STYLES[level];
          const count = countByLevel(level);
          const isActive = activeLevel === level;
          return (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 border shadow-sm",
                isActive
                  ? cn(s.pill, "border-transparent shadow-md")
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {level}
              <span className={cn("ml-1.5 text-xs", isActive ? "opacity-70" : "opacity-50")}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Modules + Leçons ── */}
      {filtered.map((mod) => {
        const lessons = mod.lessons.filter(Boolean) as Lesson[];
        if (lessons.length === 0) return null;
        const level = mod.levelCode as Level;
        const s = LEVEL_STYLES[level] ?? LEVEL_STYLES.A1;

        return (
          <div key={mod.id} className="space-y-4">
            {/* En-tête de module */}
            <div className="flex items-center gap-3">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm", s.dot)}>
                {mod.levelCode}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold leading-tight">{mod.title}</h2>
                {mod.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate hidden sm:block">
                    {mod.description}
                  </p>
                )}
              </div>
              <span className={cn("ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", s.badge)}>
                {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Grille de leçons */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => {
                const isCompleted = completedIds.has(lesson.id);
                return (
                  <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                    <div className={cn(
                      "group flex flex-col gap-3 rounded-2xl border bg-card p-4",
                      "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
                      isCompleted && cn("border-l-[3px]", s.dot.replace("bg-", "border-l-"))
                    )}>
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-0.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight line-clamp-2">
                          {lesson.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <span className={cn("rounded-lg px-2 py-0.5 text-[11px] font-medium", s.badge)}>
                          {TYPE_LABELS[lesson.type] ?? lesson.type}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                          <Clock className="h-3 w-3" />
                          {lesson.estimatedMinutes ?? "?"} min
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.every((m) => m.lessons.filter(Boolean).length === 0) && (
        <p className="text-sm text-muted-foreground">Aucune leçon pour ce niveau.</p>
      )}
    </div>
  );
}
