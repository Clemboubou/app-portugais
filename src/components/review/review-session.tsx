"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flashcard } from "@/components/vocabulary/flashcard";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface VocabItem {
  id: number;
  portuguese: string;
  phonetic: string;
  french: string;
}

interface DueCard {
  card: {
    id: number;
    itemId: number;
    itemType: string;
    state: number;
    stability: number;
    difficulty: number;
    reps: number;
    lapses: number;
  };
  vocab: VocabItem | null;
}

interface RatingOption {
  rating: number;
  label: string;
  interval: string;
  variant: "destructive" | "outline" | "default" | "secondary";
}

export function ReviewSession() {
  const [cards, setCards] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionResults, setSessionResults] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isSessionDone, setIsSessionDone] = useState(false);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/srs/due");
      if (response.ok) {
        const data = (await response.json()) as { cards: DueCard[] };
        setCards(data.cards);
        if (data.cards.length === 0) {
          setIsSessionDone(true);
        }
      }
    } catch {
      // Silently fail
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progressPercent =
    totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

  async function handleRating(rating: number) {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/srs/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.card.id,
          rating,
        }),
      });

      const ratingKey =
        rating === 1
          ? "again"
          : rating === 2
          ? "hard"
          : rating === 3
          ? "good"
          : "easy";
      setSessionResults((prev) => ({
        ...prev,
        [ratingKey]: prev[ratingKey] + 1,
      }));

      setReviewedCount((c) => c + 1);

      if (currentIndex < totalCards - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setIsSessionDone(true);
      }
    } catch {
      // Continue even if save fails
    }
    setIsSubmitting(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isFlipped) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped(true);
      }
    } else {
      if (e.key === "1") void handleRating(1);
      if (e.key === "2") void handleRating(2);
      if (e.key === "3") void handleRating(3);
      if (e.key === "4") void handleRating(4);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlipped, currentIndex, isSubmitting]);

  const ratingOptions: RatingOption[] = [
    { rating: 1, label: "À revoir", interval: "1 min", variant: "destructive" },
    { rating: 2, label: "Difficile", interval: "5 min", variant: "outline" },
    { rating: 3, label: "Bien", interval: "1 jour", variant: "default" },
    { rating: 4, label: "Facile", interval: "4 jours", variant: "secondary" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Chargement des cartes...</p>
      </div>
    );
  }

  if (isSessionDone) {
    const total =
      sessionResults.again +
      sessionResults.hard +
      sessionResults.good +
      sessionResults.easy;

    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">
          {total === 0
            ? "Aucune carte à réviser pour l'instant"
            : "Session terminée !"}
        </h2>
        {total === 0 ? (
          <div className="space-y-3 text-left rounded-lg border p-4 bg-muted/40">
            <p className="font-semibold text-sm">💡 Comment fonctionne la répétition espacée ?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-none">
              <li>• Chaque carte est planifiée selon l&apos;algorithme <strong>FSRS</strong></li>
              <li>• Une carte bien connue revient dans plusieurs jours ou semaines</li>
              <li>• Une carte difficile revient dès le lendemain</li>
              <li>• Les cartes n&apos;apparaissent que quand c&apos;est le bon moment</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Pour créer des cartes, complétez des leçons ou ajoutez des mots
              depuis le <strong>Vocabulaire</strong> ou le <strong>Dictionnaire</strong>.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Vous avez révisé {total} carte{total > 1 ? "s" : ""}.
          </p>
        )}

        {total > 0 && (
          <div className="grid grid-cols-4 gap-2">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-red-500">
                  {sessionResults.again}
                </p>
                <p className="text-xs text-muted-foreground">À revoir</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-orange-500">
                  {sessionResults.hard}
                </p>
                <p className="text-xs text-muted-foreground">Difficile</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-blue-500">
                  {sessionResults.good}
                </p>
                <p className="text-xs text-muted-foreground">Bien</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold text-green-500">
                  {sessionResults.easy}
                </p>
                <p className="text-xs text-muted-foreground">Facile</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Button onClick={() => window.location.reload()} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {total === 0 ? "Rafraîchir" : "Nouvelle session"}
        </Button>
      </div>
    );
  }

  if (!currentCard || !currentCard.vocab) {
    return (
      <p className="text-center text-muted-foreground">
        Erreur : carte invalide.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Carte {currentIndex + 1} / {totalCards}
          </span>
          <Badge variant="outline">{reviewedCount} révisée{reviewedCount > 1 ? "s" : ""}</Badge>
        </div>
        <Progress value={progressPercent} />
      </div>

      {/* Flashcard */}
      <Flashcard
        portuguese={currentCard.vocab.portuguese}
        phonetic={currentCard.vocab.phonetic}
        french={currentCard.vocab.french}
        onFlip={setIsFlipped}
      />

      {/* Boutons de notation */}
      {isFlipped && (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Comment avez-vous trouvé ?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ratingOptions.map((opt) => (
              <Button
                key={opt.rating}
                variant={opt.variant}
                onClick={() => void handleRating(opt.rating)}
                disabled={isSubmitting}
                className="flex flex-col gap-0.5 py-3"
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-[10px] opacity-70">{opt.rating}</span>
              </Button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Raccourcis : 1-4
          </p>
        </div>
      )}

      {!isFlipped && (
        <p className="text-center text-sm text-muted-foreground">
          Cliquer sur la carte ou appuyer sur Espace pour retourner
        </p>
      )}
    </div>
  );
}
