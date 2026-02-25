import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_PROFESSOR } from "@/lib/ai/prompts";

interface GrammarExplainRequest {
  pointId: string;
  title: string;
  level: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GrammarExplainRequest;

    if (!body.title || !body.level) {
      return NextResponse.json(
        { error: "Les champs 'title' et 'level' sont requis." },
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

    const userMessage = `Explique en détail le point de grammaire "${body.title}" pour un apprenant de niveau ${body.level} en portugais européen (variante de Lisbonne).
Donne :
1. Une explication claire en français
2. Au moins 3 exemples avec traduction
3. Les erreurs fréquentes à éviter
4. Une astuce mnémotechnique si possible`;

    const response = await ollamaChat("general", [
      { role: "system", content: PROMPT_PROFESSOR },
      { role: "user", content: userMessage },
    ]);

    return NextResponse.json({ explanation: response });
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
