import { NextRequest, NextResponse } from "next/server";
import {
  getCardByItem,
  createSrsCard,
  updateSrsCard,
  getCardById,
} from "@/lib/db/queries/srs";
import { fsrs, Rating, State } from "@/lib/srs/fsrs";
import type { Card } from "@/lib/srs/fsrs";

interface AnkiReviewRequest {
  vocabId: number;
  rating: 1 | 2 | 3 | 4;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnkiReviewRequest;

    if (!body.vocabId || !body.rating || body.rating < 1 || body.rating > 4) {
      return NextResponse.json(
        { error: "vocabId et rating (1-4) sont requis." },
        { status: 400 }
      );
    }

    // Créer la carte SRS si elle n'existe pas encore
    let dbCard = getCardByItem(body.vocabId, "vocabulary");
    if (!dbCard) {
      dbCard = createSrsCard(body.vocabId, "vocabulary");
    } else {
      // Recharger avec l'ID pour être sûr
      dbCard = getCardById(dbCard.id) ?? dbCard;
    }

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

    const savedCard = updateSrsCard(dbCard.id, {
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
    console.error("Erreur anki/review:", error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
