"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  CheckCircle2,
  ExternalLink,
  Printer,
  RotateCcw,
  Layers,
  TrendingUp,
  Calendar,
  Zap,
  BrainCircuit,
  BookOpenText,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASES, PLAN_STATS, TECHNIQUES, type PhaseInfo, type PlanDay } from "@/components/myplan/plan-data";

// ============================================================
// STORAGE — Progression sauvegardée en localStorage
// ============================================================
const STORAGE_KEY = "myplan-progress";

interface Progress {
  completedWeeks: number[];
  startedAt: string | null;
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* ignore */ }
  return { completedWeeks: [], startedAt: null };
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ============================================================
// COMPOSANT : En-tête avec statistiques
// ============================================================
function PlanHeader({ progress }: { progress: Progress }) {
  const totalWeeks = PLAN_STATS.totalWeeks;
  const doneWeeks = progress.completedWeeks.length;
  const pct = totalWeeks > 0 ? Math.round((doneWeeks / totalWeeks) * 100) : 0;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#1A56DB] to-blue-600 p-6 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Calendar className="h-6 w-6 opacity-90" />
        <h1 className="text-2xl font-bold">Mon Plan 6 mois</h1>
        <Badge className="bg-white/20 text-white border-0 text-xs">A1 → B2</Badge>
      </div>
      <p className="text-blue-100 text-sm mb-4">
        Programme intensif de 26 semaines pour atteindre le niveau B2 en portugais européen — 1 heure par jour, 7 jours sur 7.
      </p>

      {/* Barre de progression globale */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-blue-100">
          <span>{doneWeeks}/{totalWeeks} semaines complétées</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT : Faisabilité et statistiques
// ============================================================
function FeasibilitySection() {
  const stats = PLAN_STATS;
  const items = [
    { label: "Heures totales", value: `${stats.totalHours}h`, icon: Clock },
    { label: "Leçons", value: `${stats.content.lessons}`, icon: BookOpen },
    { label: "Grammaire", value: `${stats.content.grammarPoints} pts`, icon: GraduationCap },
    { label: "Vocabulaire", value: `${stats.content.vocabularyItems}+`, icon: Layers },
    { label: "Écoute", value: `${stats.content.listeningExercises} ex.`, icon: Target },
    { label: "Mini-stories", value: `${stats.content.miniStories}`, icon: BookOpenText },
    { label: "Mnémotechniques", value: `${stats.content.mnemonics}`, icon: Lightbulb },
    { label: "Examens", value: `${stats.content.exams}`, icon: CheckCircle2 },
  ];

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Faisabilité : A1 → B2 en 6 mois
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.label} className="text-center p-2 rounded-xl bg-muted/50">
              <item.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">FAISABLE</p>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            182 heures disponibles (26 sem. × 7j × 1h) couvrent parfaitement les ~170 heures de contenu structuré de l&apos;application.
            Les 7 priorités (Vocabulaire, Anki, Grammaire, Écoute, Lire, Écrire, Prononciation) + les extras (Culture, Presse, Professeur IA) remplissent le programme.
          </p>
        </div>

        {/* Priorités */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Priorités quotidiennes</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.priorities.map((p) => (
              <Link key={p.label} href={p.url}>
                <Badge className="bg-[#1A56DB]/10 text-[#1A56DB] dark:bg-[#1A56DB]/20 hover:bg-[#1A56DB]/20 border-0 cursor-pointer">
                  {p.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Extras en complément</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.extras.map((e) => (
              <Link key={e.label} href={e.url}>
                <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                  {e.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPOSANT : Activité dans le programme journalier
// ============================================================
function ActivityRow({ activity }: { activity: { duration: number; label: string; description: string; url: string } }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Badge variant="outline" className="shrink-0 text-[10px] font-mono w-14 justify-center">
        {activity.duration} min
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{activity.label}</span>
          <Link href={activity.url} className="text-[#1A56DB] hover:underline shrink-0">
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT : Programme hebdomadaire type
// ============================================================
function WeeklyTemplate({ days, level }: { days: PlanDay[]; level: string }) {
  const [expandedDay, setExpandedDay] = useState<string | null>("Lundi");

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Programme hebdomadaire type — {level}
      </p>
      <div className="grid gap-2">
        {days.map((day) => {
          const isExpanded = expandedDay === day.day;
          const total = day.activities.reduce((s, a) => s + a.duration, 0);

          return (
            <div key={day.day} className="rounded-xl border overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-semibold">{day.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{day.activities.length} activités</span>
                  <Badge variant="outline" className="text-[10px]">{total} min</Badge>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 border-t divide-y divide-border/50">
                  {day.activities.map((act, idx) => (
                    <ActivityRow key={idx} activity={act} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT : Timeline des semaines d'une phase
// ============================================================
function WeekTimeline({
  phase,
  completedWeeks,
  onToggleWeek,
}: {
  phase: PhaseInfo;
  completedWeeks: number[];
  onToggleWeek: (week: number) => void;
}) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Semaine par semaine
      </p>
      <div className="space-y-2">
        {phase.weeks.map((w) => {
          const isDone = completedWeeks.includes(w.week);
          const isExpanded = expandedWeek === w.week;

          return (
            <div
              key={w.week}
              className={cn(
                "rounded-xl border transition-all",
                isDone && "bg-muted/30 border-muted"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleWeek(w.week)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300 accent-[#1A56DB] cursor-pointer"
                />

                {/* Contenu */}
                <button
                  type="button"
                  onClick={() => setExpandedWeek(isExpanded ? null : w.week)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">S{w.week}</Badge>
                    <span className={cn("text-sm font-semibold truncate", isDone && "line-through text-muted-foreground")}>
                      {w.theme}
                    </span>
                    {w.checkpoint && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] shrink-0">
                        EXAMEN
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                    )}
                  </div>
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-3 border-t">
                  <ul className="space-y-1.5 mt-2">
                    {w.content.map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-[#1A56DB] mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {w.checkpoint && (
                    <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-2.5">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {w.checkpoint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT : Section d'une phase complète
// ============================================================
function PhaseSection({
  phase,
  completedWeeks,
  onToggleWeek,
  defaultExpanded,
}: {
  phase: PhaseInfo;
  completedWeeks: number[];
  onToggleWeek: (week: number) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const phaseWeeks = Array.from(
    { length: phase.weekRange[1] - phase.weekRange[0] + 1 },
    (_, i) => phase.weekRange[0] + i
  );
  const doneInPhase = phaseWeeks.filter((w) => completedWeeks.includes(w)).length;
  const totalInPhase = phaseWeeks.length;
  const phasePct = totalInPhase > 0 ? Math.round((doneInPhase / totalInPhase) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* En-tête de phase */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left"
      >
        <Card className={cn("rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md")}>
          <div className={cn("h-1.5 bg-gradient-to-r", phase.colorFrom, phase.colorTo)} />
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold bg-gradient-to-br", phase.colorFrom, phase.colorTo)}>
                  {phase.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">Phase {phase.number} — {phase.title}</h2>
                    <Badge className={cn("text-[10px]", phase.badgeClass)}>{phase.level}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Semaines {phase.weekRange[0]}–{phase.weekRange[1]} · {phase.totalWeeks} semaines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">{doneInPhase}/{totalInPhase}</span>
                  <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden mt-0.5">
                    <div
                      className={cn("h-full rounded-full transition-all bg-gradient-to-r", phase.colorFrom, phase.colorTo)}
                      style={{ width: `${phasePct}%` }}
                    />
                  </div>
                </div>
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </button>

      {expanded && (
        <div className="pl-4 md:pl-8 space-y-6">
          {/* Description et objectifs */}
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="pt-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Objectifs</p>
                <ul className="space-y-1">
                  {phase.goals.map((goal, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Target className="h-3.5 w-3.5 text-[#1A56DB] mt-0.5 shrink-0" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Ressources de l&apos;app</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {phase.resources.map((r) => (
                    <Link key={r.label} href={r.url} className="group">
                      <div className="rounded-lg border p-2 hover:border-[#1A56DB]/50 hover:bg-[#1A56DB]/5 transition-colors">
                        <p className="text-xs font-medium group-hover:text-[#1A56DB]">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.value}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programme hebdomadaire type */}
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="pt-5">
              <WeeklyTemplate days={phase.template} level={phase.level} />
            </CardContent>
          </Card>

          {/* Timeline des semaines */}
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="pt-5">
              <WeekTimeline
                phase={phase}
                completedWeeks={completedWeeks}
                onToggleWeek={onToggleWeek}
              />
            </CardContent>
          </Card>

          {/* Jalon */}
          <div className="rounded-xl bg-gradient-to-r from-[#1A56DB]/5 to-blue-50 dark:from-[#1A56DB]/10 dark:to-background border border-[#1A56DB]/20 p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-[#1A56DB]" />
              <p className="text-sm font-bold text-[#1A56DB]">{phase.milestone}</p>
            </div>
            <p className="text-xs text-muted-foreground">{phase.milestoneDetail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPOSANT : Les 10 techniques intégrées dans le plan
// ============================================================
function TechniquesSection() {
  const phaseColors: Record<string, string> = {
    A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    A2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    B1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    B2: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-[#1A56DB]" />
          Les 10 techniques intégrées dans ce plan
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Ce plan combine les méthodes les plus efficaces pour l&apos;acquisition du portugais européen.
          Chaque technique est accessible directement depuis l&apos;application.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {TECHNIQUES.map((t) => (
            <Link key={t.number} href={t.url} className="group">
              <div className="flex items-start gap-3 rounded-xl border p-3 hover:border-[#1A56DB]/50 hover:bg-[#1A56DB]/5 transition-colors h-full">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1A56DB]/10 text-[10px] font-bold text-[#1A56DB]">
                  {t.number}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold group-hover:text-[#1A56DB] transition-colors">{t.label}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${phaseColors[t.phase] ?? ""}`}>
                      dès {t.phase}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                </div>
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 group-hover:text-[#1A56DB] mt-0.5 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPOSANT : Conseils pratiques
// ============================================================
function TipsSection() {
  const tips = [
    {
      title: "L'Anki est NON-NÉGOCIABLE",
      text: "10 minutes de révision SRS chaque jour, même les jours de repos. C'est le pilier de la mémorisation à long terme. Ne jamais sauter une journée.",
      icon: Layers,
    },
    {
      title: "La prononciation dès le jour 1",
      text: "Le portugais européen a des sons très différents du français (voyelles réduites, nasales, R uvulaire). Travailler la prononciation tôt évite de prendre de mauvaises habitudes.",
      icon: Target,
    },
    {
      title: "Mini-stories : structures en contexte",
      text: "Les mini-stories A1→B1 exposent aux structures naturellement répétées. Lire, écouter l'accent de Lisbonne via TTS, répondre aux questions IA — et ajouter au SRS en un clic.",
      icon: BookOpenText,
    },
    {
      title: "Mnémotechniques : la mémoire associative",
      text: "155 associations visuelles et sonores dans l'Anki (émoji + astuce mnémotechnique). Exemple : gravata (cravate) = cra→gra+vata. Le cerveau retient les images, pas les listes.",
      icon: Lightbulb,
    },
    {
      title: "Lire TOUS les jours",
      text: "Même 5 minutes. L'exposition écrite renforce le vocabulaire, la grammaire et l'orthographe simultanément. Utilisez le dictionnaire intégré pour les mots inconnus.",
      icon: BookOpen,
    },
    {
      title: "Le subjonctif, patience",
      text: "Le subjonctif portugais est le boss final. Il arrive en B1, se complexifie en B2. Ne pas paniquer — la pratique régulière avec le Professeur IA aide énormément.",
      icon: GraduationCap,
    },
    {
      title: "La presse dès le B1",
      text: "Dès la semaine 14, commencez à lire des articles de presse portugaise (page Presse PT). Même si c'est difficile, l'exposition à du vrai portugais accélère considérablement la progression.",
      icon: TrendingUp,
    },
    {
      title: "Les erreurs sont normales",
      text: "La page Erreurs Courantes recense les 55 pièges les plus fréquents pour les francophones. Consultez-la régulièrement pour éviter les fossilisations.",
      icon: CheckCircle2,
    },
  ];

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Conseils pour réussir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {tips.map((tip) => (
            <div key={tip.title} className="rounded-xl bg-muted/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <tip.icon className="h-3.5 w-3.5 text-[#1A56DB] shrink-0" />
                <p className="text-sm font-semibold">{tip.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-5">{tip.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function MyPlanPage() {
  const [progress, setProgress] = useState<Progress>({ completedWeeks: [], startedAt: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  const toggleWeek = useCallback((week: number) => {
    setProgress((prev) => {
      const next: Progress = {
        ...prev,
        startedAt: prev.startedAt ?? new Date().toISOString(),
        completedWeeks: prev.completedWeeks.includes(week)
          ? prev.completedWeeks.filter((w) => w !== week)
          : [...prev.completedWeeks, week].sort((a, b) => a - b),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const empty: Progress = { completedWeeks: [], startedAt: null };
    saveProgress(empty);
    setProgress(empty);
  }, []);

  if (!loaded) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto print:max-w-none">
      <PlanHeader progress={progress} />
      <FeasibilitySection />
      <TechniquesSection />

      {/* Actions */}
      <div className="flex gap-3 print:hidden">
        <Button
          variant="outline"
          onClick={resetProgress}
          className="rounded-xl"
          size="sm"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Réinitialiser
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="rounded-xl"
          size="sm"
        >
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Imprimer
        </Button>
      </div>

      {/* Les 4 phases */}
      {PHASES.map((phase, idx) => (
        <PhaseSection
          key={phase.number}
          phase={phase}
          completedWeeks={progress.completedWeeks}
          onToggleWeek={toggleWeek}
          defaultExpanded={idx === 0}
        />
      ))}

      <TipsSection />
    </div>
  );
}
