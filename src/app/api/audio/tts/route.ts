import { NextRequest, NextResponse } from "next/server";
import { generateTts } from "@/lib/audio/tts";

interface TtsRequest {
  text: string;
  voice?: "female" | "male";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TtsRequest;

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Le champ 'text' est requis et ne peut pas être vide." },
        { status: 400 }
      );
    }

    if (body.text.trim().length > 5000) {
      return NextResponse.json(
        { error: "Le texte ne peut pas dépasser 5000 caractères." },
        { status: 400 }
      );
    }

    if (body.voice !== undefined && body.voice !== "female" && body.voice !== "male") {
      return NextResponse.json(
        { error: "Le champ 'voice' doit être 'female' ou 'male'." },
        { status: 400 }
      );
    }

    const result = await generateTts(body.text, body.voice ?? "female");
    return NextResponse.json({ audioUrl: result.audioUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";

    // Si le serveur TTS est indisponible, le client utilisera Web Speech API
    if (message === "TTS_UNAVAILABLE") {
      return NextResponse.json({ useWebSpeech: true });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
