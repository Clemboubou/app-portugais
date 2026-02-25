"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

interface LevelSelectorProps {
  selected: Level;
  onChange: (level: Level) => void;
  levels?: Level[];
}

const ALL_LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

export function LevelSelector({ selected, onChange, levels = ALL_LEVELS }: LevelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => (
        <Button
          key={level}
          variant={selected === level ? "default" : "outline"}
          size="sm"
          className={cn(
            selected === level && "bg-[#1A56DB] hover:bg-[#1A56DB]/90"
          )}
          onClick={() => onChange(level)}
        >
          {level}
        </Button>
      ))}
    </div>
  );
}
