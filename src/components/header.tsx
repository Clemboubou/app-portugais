"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MobileSidebar } from "@/components/sidebar";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  const [currentLevel, setCurrentLevel] = useState("A1");
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    // Lire le résultat du test de positionnement
    const placementRaw = localStorage.getItem("placementResult");
    if (placementRaw) {
      try {
        const placement = JSON.parse(placementRaw) as { level: string; score: number };
        setCurrentLevel(placement.level);
        setProgressPercent(placement.score);
      } catch {
        // ignore
      }
    }

    // Lire les résultats d'examens pour le niveau le plus haut validé
    const examRaw = localStorage.getItem("examResults");
    if (examRaw) {
      try {
        const results = JSON.parse(examRaw) as { level: string; passed: boolean; score: number }[];
        const levels = ["A1", "A2", "B1", "B2"];
        let highestPassed = "";
        for (const lvl of levels) {
          const r = results.find((x) => x.level === lvl && x.passed);
          if (r) highestPassed = lvl;
        }
        if (highestPassed) {
          const nextIdx = levels.indexOf(highestPassed) + 1;
          const nextLevel = nextIdx < levels.length ? levels[nextIdx] : highestPassed;
          setCurrentLevel(nextLevel);
          const lastResult = results.find((x) => x.level === highestPassed);
          if (lastResult) setProgressPercent(lastResult.score);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4">
      <MobileSidebar />

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-sm font-semibold">
          {currentLevel}
        </Badge>
        <div className="hidden items-center gap-2 sm:flex">
          <Progress value={progressPercent} className="w-32" />
          <span className="text-xs text-muted-foreground">
            {progressPercent} %
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  );
}
