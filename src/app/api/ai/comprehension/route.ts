import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_PROFESSOR } from "@/lib/ai/prompts";

interface ComprehensionRequest {
  title: string;
  content: string;
  question: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ComprehensionRequest;

    if (!body.content || !body.question) {
      return NextResponse.json(
        { error: "Les champs 'content' et 'question' sont requis." },
        { status: 400 }
      );
    }

    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: "Ollama n'est pas disponible." },
        { status: 503 }
      );
    }

    const userMessage = `Voici un article de presse en portugais européen.
Titre : ${body.title}

Texte (extrait) :
${body.content.substring(0, 2500)}

L'apprenant pose la question suivante sur cet article :
"${body.question}"

Réponds en français de manière pédagogique. Si la question porte sur le vocabulaire,
explique le mot en contexte. Si elle porte sur la compréhension, aide à comprendre le passage.
Donne toujours des exemples en portugais européen.`;

    const response = await ollamaChat("general", [
      { role: "system", content: PROMPT_PROFESSOR },
      { role: "user", content: userMessage },
    ]);

    return NextResponse.json({ result: response });
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
