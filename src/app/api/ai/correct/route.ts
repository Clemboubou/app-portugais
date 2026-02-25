import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_PROFESSOR } from "@/lib/ai/prompts";

interface CorrectionRequest {
  text: string;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CorrectionRequest;

    if (!body.text || body.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Le champ 'text' est requis." },
        { status: 400 }
      );
    }

    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: "Ollama n'est pas disponible. Vérifiez qu'il est démarré sur le port 11434." },
        { status: 503 }
      );
    }

    const userMessage = body.context
      ? `Contexte : ${body.context}\n\nPhrase à corriger : "${body.text}"`
      : `Phrase à corriger : "${body.text}"`;

    const response = await ollamaChat("grammar", [
      { role: "system", content: PROMPT_PROFESSOR },
      { role: "user", content: userMessage },
    ]);

    return NextResponse.json({ correction: response });
  } catch (error) {
    if (error instanceof OllamaError) {
      return NextResponse.json(
        { error: `Erreur Ollama : ${error.message}` },
        { status: error.statusCode ?? 500 }
      );
    }
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
