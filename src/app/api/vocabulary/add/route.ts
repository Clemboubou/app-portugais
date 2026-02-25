import { NextRequest, NextResponse } from "next/server";
import { addVocabularyItem } from "@/lib/db/queries/vocabulary";
import { createSrsCard } from "@/lib/db/queries/srs";

interface AddWordRequest {
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AddWordRequest;

    if (!body.portuguese || !body.french) {
      return NextResponse.json(
        { error: "Les champs 'portuguese' et 'french' sont requis." },
        { status: 400 }
      );
    }

    const result = addVocabularyItem({
      portuguese: body.portuguese.trim(),
      phonetic: body.phonetic?.trim() ?? "",
      french: body.french.trim(),
      level: body.level ?? "A1",
      tags: body.tags ?? ["article"],
    });

    // Créer automatiquement une carte SRS pour ce mot
    if (result.created) {
      createSrsCard(result.id, "vocabulary");
    }

    return NextResponse.json({
      id: result.id,
      created: result.created,
      message: result.created
        ? "Mot ajouté au vocabulaire et au deck SRS."
        : "Ce mot existe déjà dans le vocabulaire.",
    });
  } catch (error) {
    console.error("Erreur ajout vocabulaire:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
