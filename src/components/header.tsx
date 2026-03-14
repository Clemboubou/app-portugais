"use client";

import { useEffect, useState } from "react";
import { MobileSidebar } from "@/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG: Record<string, { color: string; label: string; progress: number }> = {
  A1: { color: "bg-emerald-500", label: "Débutant",        progress: 16 },
  A2: { color: "bg-blue-500",    label: "Élémentaire",     progress: 32 },
  B1: { color: "bg-amber-500",   label: "Intermédiaire",   progress: 52 },
  B2: { color: "bg-violet-500",  label: "Avancé",          progress: 72 },
  C1: { color: "bg-rose-500",    label: "Courant",         progress: 90 },
};

export function Header() {
  const [currentLevel, setCurrentLevel] = useState("A1");
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const placementRaw = localStorage.getItem("placementResult");
    if (placementRaw) {
      try {
        const p = JSON.parse(placementRaw) as { level: string; score: number };
        setCurrentLevel(p.level);
        setProgressPercent(p.score);
      } catch { /* ignore */ }
    }

    const examRaw = localStorage.getItem("examResults");
    if (examRaw) {
      try {
        const results = JSON.parse(examRaw) as { level: string; passed: boolean; score: number }[];
        const levels = ["A1", "A2", "B1", "B2", "C1"];
        let highestPassed = "";
        for (const lvl of levels) {
          if (results.find((x) => x.level === lvl && x.passed)) highestPassed = lvl;
        }
        if (highestPassed) {
          const nextIdx = levels.indexOf(highestPassed) + 1;
          const next = nextIdx < levels.length ? levels[nextIdx] : highestPassed;
          setCurrentLevel(next);
          const last = results.find((x) => x.level === highestPassed);
          if (last) setProgressPercent(last.score);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const cfg = LEVEL_CONFIG[currentLevel] ?? LEVEL_CONFIG.A1;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card/80 backdrop-blur-sm px-4 md:px-6">
      <MobileSidebar />

      {/* Niveau + barre */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm",
            cfg.color
          )}
        >
          {currentLevel}
        </div>

        <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
          <span className="text-xs font-semibold text-foreground/80 leading-none">
            {cfg.label}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", cfg.color)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{progressPercent}%</span>
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
