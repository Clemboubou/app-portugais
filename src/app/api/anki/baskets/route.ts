import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { srsCards } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = db
      .select({ card: srsCards })
      .from(srsCards)
      .where(eq(srsCards.itemType, "vocabulary"))
      .all();

    // Paniers basés sur l'état FSRS
    // Très difficile : Relearning (state=3) OU lapses >= 3
    // Difficile       : Learning (state=1) et pas encore échoué 3+ fois
    // Bien            : Review (state=2) avec stabilité < 14 jours
    // Facile          : Review (state=2) avec stabilité >= 14 jours

    const veryHard = rows.filter(
      (r) => r.card.state === 3 || r.card.lapses >= 3
    ).length;

    const hard = rows.filter(
      (r) => r.card.state === 1 && r.card.lapses < 3
    ).length;

    const good = rows.filter(
      (r) => r.card.state === 2 && r.card.stability < 14
    ).length;

    const easy = rows.filter(
      (r) => r.card.state === 2 && r.card.stability >= 14
    ).length;

    return NextResponse.json({ veryHard, hard, good, easy });
  } catch (error) {
    console.error("Erreur anki/baskets:", error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
