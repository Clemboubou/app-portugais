import { NextResponse } from "next/server";
import { getAllSrsCardIds, createSrsCard } from "@/lib/db/queries/srs";
import { getVocabularyByLevel } from "@/lib/db/queries/vocabulary";

export async function POST() {
  try {
    const existingIds = new Set(getAllSrsCardIds());
    const vocabItems = getVocabularyByLevel("A1");

    let created = 0;
    for (const item of vocabItems) {
      if (!existingIds.has(item.id)) {
        createSrsCard(item.id, "vocabulary");
        created++;
      }
    }

    return NextResponse.json({
      message: `${created} cartes SRS créées.`,
      created,
      total: vocabItems.length,
    });
  } catch (error) {
    console.error("Erreur initialisation SRS:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
