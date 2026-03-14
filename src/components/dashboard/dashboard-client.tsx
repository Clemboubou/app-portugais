"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  RotateCcw, BookOpen, ChevronRight,
  Mic, Headphones, Languages, FlaskConical,
  Flame, Target, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  dueCount: number;
  completedLessons: number;
  studyTimeMinutes: number;
}

interface StoredPlacement {
  level: string;
  score: number;
  date: string;
}

const LEVEL_COLORS: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  A1: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200", label: "Débutant" },
  A2: { bg: "bg-blue-500",    text: "text-blue-600",    ring: "ring-blue-200",    label: "Élémentaire" },
  B1: { bg: "bg-amber-500",   text: "text-amber-600",   ring: "ring-amber-200",   label: "Intermédiaire" },
  B2: { bg: "bg-violet-500",  text: "text-violet-600",  ring: "ring-violet-200",  label: "Avancé" },
  C1: { bg: "bg-rose-500",    text: "text-rose-600",    ring: "ring-rose-200",    label: "Courant" },
};

const QUICK_ACTIONS = [
  {
    href: "/lessons",
    label: "Leçons",
    sub: "Curriculum A1→C1",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-600",
    light: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    href: "/speaking",
    label: "Parler",
    sub: "Conversation + oral",
    icon: Mic,
    gradient: "from-rose-500 to-pink-600",
    light: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    href: "/listening",
    label: "Écouter",
    sub: "Compréhension orale",
    icon: Headphones,
    gradient: "from-amber-500 to-orange-600",
    light: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    href: "/vocabulary",
    label: "Vocabulaire",
    sub: "Flashcards FSRS",
    icon: Languages,
    gradient: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

export function DashboardClient({
  dueCount,
  completedLessons,
  studyTimeMinutes,
}: DashboardClientProps) {
  const [placement, setPlacement] = useState<StoredPlacement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("placementResult");
    if (stored) {
      try { setPlacement(JSON.parse(stored) as StoredPlacement); }
      catch { /* ignore */ }
    }
  }, []);

  const hours = Math.floor(studyTimeMinutes / 60);
  const mins = studyTimeMinutes % 60;
  const timeLabel = hours > 0
    ? `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    : `${mins} min`;

  const lvl = placement?.level ?? "A1";
  const lvlCfg = LEVEL_COLORS[lvl] ?? LEVEL_COLORS.A1;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Bannière d'accueil ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(221,83%,53%)] via-[hsl(235,83%,57%)] to-[hsl(262,83%,58%)] p-6 text-white shadow-lg shadow-blue-200/40 dark:shadow-blue-900/30">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100/80">Bienvenue sur</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
            Portugais Européen
          </h1>

          {placement ? (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold ring-2 ring-white/30 backdrop-blur-sm">
                {lvl}
              </div>
              <div>
                <p className="text-sm font-semibold">{lvlCfg.label}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-28 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/80 transition-all"
                      style={{ width: `${placement.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-blue-100/70">{placement.score}%</span>
                </div>
              </div>
              <Link href="/placement" className="ml-auto">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/15 text-xs">
                  Changer
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-blue-100/80">
                Commencez par évaluer votre niveau.
              </p>
              <Link href="/placement">
                <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 shadow-sm font-semibold">
                  Test de niveau
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Décor géométrique */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-2 -bottom-12 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Révisions dues */}
        <div className={cn(
          "group relative rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md",
          dueCount > 0 && "border-amber-200/70 dark:border-amber-800/40"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50">
              <Flame className="h-5 w-5 text-amber-500" />
            </div>
            {dueCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                À faire
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tabular-nums">{dueCount}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Révisions dues</p>
          </div>
          {dueCount > 0 && (
            <Link href="/review" className="mt-4 block">
              <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                Réviser maintenant
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Leçons complétées */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              sur 135
            </span>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tabular-nums">{completedLessons}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Leçons complétées</p>
          </div>
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${Math.min((completedLessons / 135) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Temps d'étude */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold tabular-nums">
              {studyTimeMinutes > 0 ? timeLabel : "—"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">Temps d&apos;étude</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {studyTimeMinutes === 0
              ? "Commencez une leçon !"
              : studyTimeMinutes < 60
              ? "Bien démarré !"
              : "Excellent travail !"}
          </p>
        </div>
      </div>

      {/* ── Accès rapide ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Continuer à apprendre</h2>
          <Link href="/lessons">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              Toutes les leçons <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "group flex flex-col items-start gap-3 rounded-2xl border p-4 transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-card"
              )}>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  item.light
                )}>
                  <item.icon className={cn("h-5 w-5", item.iconColor)} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Outils ── */}
      <div>
        <h2 className="mb-4 text-base font-semibold">Outils</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { href: "/placement", icon: FlaskConical, label: "Test de positionnement", sub: "Évaluez votre niveau CECRL", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
            { href: "/exam", icon: Target, label: "Examens de niveau", sub: "Validez A1 → C1", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40" },
            { href: "/review", icon: RotateCcw, label: "Révisions SRS", sub: `${dueCount} carte${dueCount !== 1 ? "s" : ""} à revoir`, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="group flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", item.bg)}>
                  <item.icon className={cn("h-4.5 w-4.5", item.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
