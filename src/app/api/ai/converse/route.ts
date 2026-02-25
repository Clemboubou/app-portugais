import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_NATIVE_FRIEND } from "@/lib/ai/prompts";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface ConversationRequest {
  messages: ConversationMessage[];
  scenario: string;
  level: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ConversationRequest;

    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Le champ 'messages' est requis." },
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

    const systemPrompt = `${PROMPT_NATIVE_FRIEND}

Scénario : ${body.scenario}
Niveau CECRL de l'apprenant : ${body.level}`;

    const ollamaMessages = [
      { role: "system" as const, content: systemPrompt },
      ...body.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await ollamaChat("conversation", ollamaMessages);

    return NextResponse.json({
      message: {
        role: "assistant",
        content: response,
      },
    });
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
