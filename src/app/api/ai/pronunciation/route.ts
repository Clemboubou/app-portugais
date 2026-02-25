import { NextResponse } from "next/server";
import { ollamaChat } from "@/lib/ai/ollama";
import { PROMPT_PROFESSOR } from "@/lib/ai/prompts";

interface PronunciationRequest {
  expected: string;
  transcribed: string;
  score: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PronunciationRequest;

    if (!body.expected || body.transcribed === undefined) {
      return NextResponse.json(
        { error: "Les champs 'expected' et 'transcribed' sont requis." },
        { status: 400 }
      );
    }

    const userMessage = `L'apprenant devait prononcer la phrase suivante en portugais européen :
"${body.expected}"

Voici ce que la reconnaissance vocale a transcrit :
"${body.transcribed}"

Score de similarité automatique : ${body.score}/100

Analyse la prononciation :
1. Identifie les sons ou mots mal prononcés
2. Explique les erreurs typiques des francophones avec ces sons
3. Donne des conseils concrets pour améliorer la prononciation
4. Si le score est > 80, félicite l'apprenant

Réponds en français, de manière concise et encourageante.`;

    const feedback = await ollamaChat("grammar", [
      { role: "system", content: PROMPT_PROFESSOR },
      { role: "user", content: userMessage },
    ]);

    return NextResponse.json({ feedback });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur interne du serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
