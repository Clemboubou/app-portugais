import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_PROFESSOR } from "@/lib/ai/prompts";

interface SummarizeRequest {
  title: string;
  content: string;
  mode: "summary" | "vocabulary";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SummarizeRequest;

    if (!body.mode) {
      return NextResponse.json(
        { error: "Le champ 'mode' est requis (summary ou vocabulary)." },
        { status: 400 }
      );
    }

    if (!body.content && !body.title) {
      return NextResponse.json(
        { error: "Au moins 'content' ou 'title' est requis." },
        { status: 400 }
      );
    }

    // Si le contenu est vide, utiliser le titre comme fallback
    if (!body.content) {
      body.content = body.title;
    }

    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: "Ollama n'est pas disponible." },
        { status: 503 }
      );
    }

    let userMessage: string;

    if (body.mode === "summary") {
      userMessage = `Voici un article de presse en portugais européen.
Titre : ${body.title}

Texte :
${body.content.substring(0, 3000)}

Résume cet article en français en 3-5 phrases claires. Explique le contexte pour un apprenant de portugais.`;
    } else {
      userMessage = `Voici un article de presse en portugais européen.
Titre : ${body.title}

Texte :
${body.content.substring(0, 2000)}

Identifie les 10 mots ou expressions les plus utiles de cet article pour un apprenant de portugais européen.
Pour chaque mot/expression, donne : le mot en portugais, sa prononciation phonétique (simple), et la traduction en français.
Format : une ligne par mot.`;
    }

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
