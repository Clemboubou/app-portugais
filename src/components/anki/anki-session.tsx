"use client";

import { useState, useEffect, useCallback } from "react";
import { AnkiCard } from "./anki-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Rating, State, getNextReviewText } from "@/lib/srs/fsrs";
import type { Card } from "@/lib/srs/fsrs";
import {
  CheckCircle2, RotateCcw, BookOpen, Loader2, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface VocabItem {
  id: number;
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  tags: string;
  frequency: number;
}

interface CardRow {
  vocab: VocabItem;
  card: {
    id: number;
    state: number;
    stability: number;
    difficulty: number;
    elapsedDays: number;
    scheduledDays: number;
    reps: number;
    lapses: number;
    lastReview: string | null;
    nextReview: string;
  } | null;
  sessionRetries?: number;
}

interface Stats {
  new: number;
  due: number;
  total: number;
}

// Enregistrement d'une session sauvegardée dans le localStorage
export interface SessionRecord {
  id: string;
  date: string;        // ISO datetime
  basket?: string;     // panier utilisé, si applicable
  total: number;
  good: number;
  again: number;
  hardVocabIds: number[]; // vocabIds notés 1 ou 2
}

interface AnkiSessionProps {
  /** Filtrer par panier FSRS */
  basket?: string;
  /** Filtrer par IDs de vocabulaire spécifiques */
  ids?: number[];
  /** Callback quand l'utilisateur clique "Recommencer" hors session panier/ids */
  onReset?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes UI
// ─────────────────────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "À revoir",  color: "bg-red-500 hover:bg-red-600 text-white" },
  2: { label: "Difficile", color: "bg-orange-500 hover:bg-orange-600 text-white" },
  3: { label: "Bien",      color: "bg-blue-500 hover:bg-blue-600 text-white" },
  4: { label: "Facile",    color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  A2: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  B1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  B2: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  C1: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const BASKET_LABELS: Record<string, { label: string; color: string }> = {
  "very-hard": { label: "Panier : Très difficile", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  "hard":      { label: "Panier : Difficile",       color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  "good":      { label: "Panier : Bien",             color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  "easy":      { label: "Panier : Facile",           color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

// Nombre max de re-passages pour une carte "À revoir" dans la même session
const MAX_SESSION_RETRIES = 3;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildPreviews(row: CardRow): Record<number, string> {
  const card: Card = row.card
    ? {
        state: row.card.state as State,
        stability: row.card.stability,
        difficulty: row.card.difficulty,
        elapsedDays: row.card.elapsedDays,
        scheduledDays: row.card.scheduledDays,
        reps: row.card.reps,
        lapses: row.card.lapses,
        lastReview: row.card.lastReview ? new Date(row.card.lastReview) : null,
        nextReview: new Date(row.card.nextReview),
      }
    : {
        state: State.New,
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        lastReview: null,
        nextReview: new Date(),
      };

  return {
    1: getNextReviewText(card, Rating.Again),
    2: getNextReviewText(card, Rating.Hard),
    3: getNextReviewText(card, Rating.Good),
    4: getNextReviewText(card, Rating.Easy),
  };
}

function saveSessionToHistory(session: SessionRecord): void {
  try {
    const KEY = "anki_history";
    const existing = JSON.parse(localStorage.getItem(KEY) ?? "[]") as SessionRecord[];
    const updated = [session, ...existing].slice(0, 30); // conserver les 30 dernières sessions
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    /* ignore les erreurs localStorage */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────────────────

export function AnkiSession({ basket, ids, onReset }: AnkiSessionProps = {}) {
  const [queue, setQueue] = useState<CardRow[]>([]);
  const [current, setCurrent] = useState<CardRow | null>(null);
  const [stats, setStats] = useState<Stats>({ new: 0, due: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Compteurs de session
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionGood, setSessionGood] = useState(0);
  const [sessionAgain, setSessionAgain] = useState(0);

  // Suivi des cartes notées (pour l'historique)
  const [sessionCards, setSessionCards] = useState<{ vocabId: number; rating: number }[]>([]);

  const buildApiUrl = useCallback(() => {
    if (ids && ids.length > 0) {
      return `/api/anki/cards?ids=${ids.join(",")}&limit=50`;
    }
    if (basket) {
      return `/api/anki/cards?basket=${basket}&limit=50`;
    }
    return "/api/anki/cards?limit=20";
  }, [basket, ids]);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl());
      const data = (await res.json()) as { cards: CardRow[]; stats: Stats };
      const cards = data.cards.map((c) => ({ ...c, sessionRetries: 0 }));
      setStats(data.stats);
      if (cards.length > 0) {
        setCurrent(cards[0]);
        setQueue(cards.slice(1));
      } else {
        setCurrent(null);
        setQueue([]);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  async function handleRating(rating: 1 | 2 | 3 | 4) {
    if (!current || submitting) return;
    setSubmitting(true);

    // 1. Sauvegarder en DB
    try {
      await fetch("/api/anki/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabId: current.vocab.id, rating }),
      });
    } catch {
      /* continue même en cas d'erreur réseau */
    }

    // 2. Enregistrer la carte dans l'historique de session
    const allCards = [...sessionCards, { vocabId: current.vocab.id, rating }];
    setSessionCards(allCards);

    // 3. Mettre à jour les compteurs
    const newTotal = sessionTotal + 1;
    const newGood  = sessionGood  + (rating >= 3 ? 1 : 0);
    const newAgain = sessionAgain + (rating === 1 ? 1 : 0);
    setSessionTotal(newTotal);
    if (rating >= 3) setSessionGood(newGood);
    if (rating === 1) setSessionAgain(newAgain);

    // 4. Construire la prochaine queue
    const nextQueue = [...queue];
    if (rating === 1) {
      const retries = (current.sessionRetries ?? 0) + 1;
      if (retries < MAX_SESSION_RETRIES) {
        nextQueue.push({ ...current, sessionRetries: retries });
      }
    }

    // 5. Avancer ou terminer
    if (nextQueue.length === 0) {
      // Sauvegarder la session dans l'historique localStorage
      const hardIds = allCards.filter((c) => c.rating <= 2).map((c) => c.vocabId);
      saveSessionToHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        basket,
        total: newTotal,
        good: newGood,
        again: newAgain,
        hardVocabIds: hardIds,
      });
      setCurrent(null);
      setQueue([]);
      setDone(true);
    } else {
      setCurrent(nextQueue[0]);
      setQueue(nextQueue.slice(1));
      setRevealed(false);
    }

    setSubmitting(false);
  }

  function restart() {
    setDone(false);
    setCurrent(null);
    setQueue([]);
    setSessionTotal(0);
    setSessionGood(0);
    setSessionAgain(0);
    setSessionCards([]);
    onReset?.();
    void loadCards();
  }

  // ── Chargement ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Chargement des cartes…</p>
      </div>
    );
  }

  // ── Pas de cartes ────────────────────────────────────────────────────────────
  if (!loading && !current && !done) {
    const isBasketEmpty = basket || ids;
    return (
      <div className="rounded-2xl border bg-card p-10 text-center space-y-3">
        <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium">
          {isBasketEmpty
            ? "Aucune carte dans ce panier"
            : "Aucune carte à étudier pour l'instant"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isBasketEmpty
            ? "Ce panier est vide pour le moment."
            : "Les cartes difficiles reviendront dans quelques minutes.\nAjoutez du vocabulaire depuis les leçons ou le dictionnaire."}
        </p>
        <Button variant="outline" onClick={restart} className="rounded-xl">
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Vérifier à nouveau
        </Button>
      </div>
    );
  }

  // ── Session terminée ─────────────────────────────────────────────────────────
  if (done) {
    const pct = sessionTotal > 0 ? Math.round((sessionGood / sessionTotal) * 100) : 0;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <div>
            <p className="text-2xl font-bold">{pct}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {sessionGood}/{sessionTotal} cartes correctes
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-lg font-bold">{sessionTotal}</p>
              <p className="text-[10px] text-muted-foreground">Cartes vues</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3">
              <p className="text-lg font-bold text-emerald-600">{sessionGood}</p>
              <p className="text-[10px] text-muted-foreground">Bien/Facile</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-3">
              <p className="text-lg font-bold text-red-500">{sessionAgain}</p>
              <p className="text-[10px] text-muted-foreground">À revoir</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Session sauvegardée dans l&apos;historique.{" "}
            Les cartes difficiles sont programmées selon l&apos;algorithme FSRS.
          </p>

          <Button onClick={restart} className="rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouvelle session
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const isNew = !current.card;
  const previews = revealed ? buildPreviews(current) : null;
  const totalInSession = queue.length + 1;
  const progressDone = sessionTotal;
  const progressTotal = progressDone + totalInSession;
  const progress = progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0;

  const basketInfo = basket ? BASKET_LABELS[basket] : null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Badge panier ou IDs */}
      {(basketInfo || ids) && (
        <div className="flex justify-center">
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            basketInfo ? basketInfo.color : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          )}>
            {basketInfo ? basketInfo.label : `Révision : ${ids?.length} mots difficiles`}
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {progressDone + 1} / {progressTotal}
            {current.sessionRetries && current.sessionRetries > 0 ? (
              <span className="ml-1.5 text-orange-500 font-medium">
                (repasse #{current.sessionRetries + 1})
              </span>
            ) : null}
          </span>
          <div className="flex gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">
              {stats.new} nouveaux
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {stats.due} dus
            </span>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Badge niveau */}
        <div className="flex justify-end">
          <span className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-full",
            LEVEL_COLORS[current.vocab.level] ?? "bg-muted text-muted-foreground"
          )}>
            {current.vocab.level}
          </span>
        </div>
      </div>

      {/* Carte */}
      <AnkiCard
        vocab={current.vocab}
        isNew={isNew}
        revealed={revealed}
        onReveal={() => setRevealed((r) => !r)}
      />

      {/* Boutons de notation */}
      {revealed && (
        <div className="space-y-2">
          <p className="text-center text-xs text-muted-foreground mb-3">
            Comment vous en êtes-vous souvenu ?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((rating) => {
              const r = RATING_LABELS[rating];
              return (
                <button
                  key={rating}
                  onClick={() => void handleRating(rating)}
                  disabled={submitting}
                  className={cn(
                    "flex flex-col items-center rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-150 shadow-sm",
                    r.color,
                    submitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-[11px] font-bold">{r.label}</span>
                  {previews && (
                    <span className="mt-0.5 opacity-75 text-[10px]">
                      {previews[rating]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-[10px] text-muted-foreground pt-1">
            FSRS · Les intervalles sont calculés selon votre historique de mémorisation
          </p>
        </div>
      )}

      {/* Recommencer */}
      <div className="flex justify-center pt-2">
        <button
          onClick={restart}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Recommencer
        </button>
      </div>
    </div>
  );
}
