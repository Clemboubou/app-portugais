import { NextRequest, NextResponse } from "next/server";
import { getCardById, updateSrsCard } from "@/lib/db/queries/srs";
import { fsrs, Rating, State } from "@/lib/srs/fsrs";
import type { Card } from "@/lib/srs/fsrs";

interface ReviewRequest {
  cardId: number;
  rating: 1 | 2 | 3 | 4;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReviewRequest;

    if (!body.cardId || !body.rating || body.rating < 1 || body.rating > 4) {
      return NextResponse.json(
        { error: "cardId et rating (1-4) sont requis." },
        { status: 400 }
      );
    }

    const dbCard = getCardById(body.cardId);
    if (!dbCard) {
      return NextResponse.json(
        { error: "Carte non trouvée." },
        { status: 404 }
      );
    }

    // Convertir la carte DB en carte FSRS
    const card: Card = {
      state: dbCard.state as State,
      stability: dbCard.stability,
      difficulty: dbCard.difficulty,
      elapsedDays: dbCard.elapsedDays,
      scheduledDays: dbCard.scheduledDays,
      reps: dbCard.reps,
      lapses: dbCard.lapses,
      lastReview: dbCard.lastReview ? new Date(dbCard.lastReview) : null,
      nextReview: new Date(dbCard.nextReview),
    };

    const now = new Date();
    const result = fsrs.repeat(card, now, body.rating as Rating);
    const updated = result.card;

    // Sauvegarder en DB
    const savedCard = updateSrsCard(body.cardId, {
      state: updated.state,
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsedDays: Math.round(updated.elapsedDays),
      scheduledDays: updated.scheduledDays,
      lastReview: now.toISOString(),
      nextReview: updated.nextReview.toISOString(),
      reps: updated.reps,
      lapses: updated.lapses,
    });

    return NextResponse.json({ card: savedCard, log: result.log });
  } catch (error) {
    console.error("Erreur SRS review:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
