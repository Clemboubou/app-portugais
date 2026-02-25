"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DayData {
  date: string;
  count: number;
  items: number;
}

interface YearlyHeatmapProps {
  data: DayData[];
}

function getIntensity(items: number, max: number): number {
  if (items === 0) return 0;
  if (max === 0) return 0;
  const ratio = items / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-blue-200 dark:bg-blue-900",
  "bg-blue-400 dark:bg-blue-700",
  "bg-blue-500 dark:bg-blue-500",
  "bg-[#1A56DB] dark:bg-blue-400",
];

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const DAY_LABELS = ["", "Lun", "", "Mer", "", "Ven", ""];

export function YearlyHeatmap({ data }: YearlyHeatmapProps) {
  // Construire la map date → items
  const dataMap = new Map<string, number>();
  for (const d of data) {
    dataMap.set(d.date, d.items);
  }

  // Calculer le max
  const maxItems = Math.max(...data.map((d) => d.items), 1);

  // Générer les 365 jours (du plus ancien au plus récent)
  const today = new Date();
  const days: Array<{ date: string; items: number; dayOfWeek: number }> = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      items: dataMap.get(dateStr) ?? 0,
      dayOfWeek: d.getDay(), // 0=dim, 1=lun...6=sam
    });
  }

  // Organiser en colonnes (semaines)
  const weeks: Array<Array<{ date: string; items: number; dayOfWeek: number } | null>> = [];
  let currentWeek: Array<{ date: string; items: number; dayOfWeek: number } | null> = [];

  // Remplir le début de la première semaine avec null
  const firstDayOfWeek = days[0].dayOfWeek;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculer les positions des labels de mois
  const monthPositions: Array<{ label: string; weekIndex: number }> = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks.length; w++) {
    const firstDay = weeks[w].find((d) => d !== null);
    if (firstDay) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        monthPositions.push({ label: MONTH_LABELS[month], weekIndex: w });
        lastMonth = month;
      }
    }
  }

  // Stats totales
  const totalDaysActive = data.filter((d) => d.items > 0).length;
  const totalItems = data.reduce((sum, d) => sum + d.items, 0);

  // Streak actuel
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].items > 0) {
      streak++;
    } else {
      // Si c'est aujourd'hui et pas encore d'activité, on vérifie hier
      if (i === days.length - 1) continue;
      break;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Activité — 365 jours
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{totalDaysActive} jours actifs</span>
            <span>{totalItems} éléments étudiés</span>
            {streak > 0 && (
              <span className="font-medium text-[#1A56DB]">
                {streak} jour{streak > 1 ? "s" : ""} consécutif{streak > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Labels mois */}
          <div className="flex mb-1 ml-8">
            {monthPositions.map(({ label, weekIndex }, i) => {
              const nextWeek = monthPositions[i + 1]?.weekIndex ?? weeks.length;
              const span = nextWeek - weekIndex;
              return (
                <div
                  key={`${label}-${weekIndex}`}
                  className="text-xs text-muted-foreground"
                  style={{ width: `${span * 13}px` }}
                >
                  {span >= 3 ? label : ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Labels jours */}
            <div className="flex flex-col gap-[2px] mr-1 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-[11px] text-[9px] leading-[11px] text-muted-foreground text-right pr-1 w-7"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grille */}
            <div className="flex gap-[2px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {week.map((day, di) => {
                    if (!day) {
                      return (
                        <div key={di} className="w-[11px] h-[11px]" />
                      );
                    }
                    const intensity = getIntensity(day.items, maxItems);
                    const isToday = day.date === today.toISOString().split("T")[0];
                    return (
                      <div
                        key={day.date}
                        className={`w-[11px] h-[11px] rounded-[2px] ${INTENSITY_COLORS[intensity]} ${
                          isToday ? "ring-1 ring-gray-400 dark:ring-gray-500" : ""
                        }`}
                        title={`${new Date(day.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })} : ${day.items} élément${day.items !== 1 ? "s" : ""}`}
                      />
                    );
                  })}
                  {/* Remplir la dernière semaine si nécessaire */}
                  {week.length < 7 &&
                    Array.from({ length: 7 - week.length }).map((_, i) => (
                      <div key={`pad-${i}`} className="w-[11px] h-[11px]" />
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className="flex items-center justify-end gap-1 mt-2 text-xs text-muted-foreground">
            <span>Moins</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${color}`} />
            ))}
            <span>Plus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
