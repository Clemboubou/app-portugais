import { NextRequest, NextResponse } from "next/server";
import { saveConversation } from "@/lib/db/queries/conversations";

interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SaveRequest {
  scenario: string;
  level: string;
  transcript: TranscriptEntry[];
  score?: number;
  feedback?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveRequest;

    if (!body.scenario || !body.level || !body.transcript) {
      return NextResponse.json(
        { error: "Les champs 'scenario', 'level' et 'transcript' sont requis." },
        { status: 400 }
      );
    }

    const result = saveConversation({
      scenario: body.scenario,
      level: body.level,
      transcript: body.transcript,
      score: body.score,
      feedback: body.feedback,
    });

    return NextResponse.json({ id: result?.id });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la conversation :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
