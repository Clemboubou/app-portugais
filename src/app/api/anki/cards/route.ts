import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vocabularyItems, srsCards } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

type CardRow = {
  vocab: typeof vocabularyItems.$inferSelect;
  card: typeof srsCards.$inferSelect | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const basket = searchParams.get("basket");
    const idsParam = searchParams.get("ids");
    const limitParam = parseInt(searchParams.get("limit") ?? "20", 10);

    const now = new Date().toISOString();

    const baseQuery = db
      .select({
        vocab: vocabularyItems,
        card: srsCards,
      })
      .from(vocabularyItems)
      .leftJoin(
        srsCards,
        and(
          eq(srsCards.itemId, vocabularyItems.id),
          eq(srsCards.itemType, "vocabulary")
        )
      );

    // Construire la liste de base selon les filtres primaires
    let rows: CardRow[];

    if (idsParam) {
      // Session "revoir difficiles" d'une session passée
      const ids = idsParam
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      rows = ids.length > 0
        ? (baseQuery.where(inArray(vocabularyItems.id, ids)).all() as CardRow[])
        : [];
    } else if (level && level !== "all") {
      rows = baseQuery
        .where(eq(vocabularyItems.level, level))
        .orderBy(vocabularyItems.frequency)
        .all() as CardRow[];
    } else {
      rows = baseQuery
        .orderBy(vocabularyItems.frequency)
        .all() as CardRow[];
    }

    // ── Filtrage panier ────────────────────────────────────────
    if (basket) {
      const basketRows = rows.filter((r) => {
        const c = r.card;
        if (!c) return false; // les cartes jamais vues n'appartiennent à aucun panier
        switch (basket) {
          case "very-hard": return c.state === 3 || c.lapses >= 3;
          case "hard":      return c.state === 1 && c.lapses < 3;
          case "good":      return c.state === 2 && c.stability < 14;
          case "easy":      return c.state === 2 && c.stability >= 14;
          default:          return true;
        }
      });

      return NextResponse.json({
        cards: basketRows.slice(0, limitParam),
        stats: {
          new: 0,
          due: basketRows.length,
          total: basketRows.length,
        },
      });
    }

    // ── Session normale : dues + nouvelles ────────────────────
    const newCards = rows.filter((r) => !r.card).slice(0, limitParam);
    const dueCards = rows.filter(
      (r) => r.card && r.card.nextReview <= now
    );

    const combined = [...dueCards, ...newCards].slice(0, limitParam);

    return NextResponse.json({
      cards: combined,
      stats: {
        new: rows.filter((r) => !r.card).length,
        due: rows.filter((r) => r.card && r.card.nextReview <= now).length,
        total: rows.length,
      },
    });
  } catch (error) {
    console.error("Erreur anki/cards:", error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
