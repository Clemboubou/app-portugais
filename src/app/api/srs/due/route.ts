import { NextResponse } from "next/server";
import { getDueCards, getDueCardsCount } from "@/lib/db/queries/srs";

export async function GET() {
  try {
    const cards = getDueCards(50);
    const totalDue = getDueCardsCount();

    return NextResponse.json({ cards, totalDue });
  } catch (error) {
    console.error("Erreur récupération cartes dues:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
