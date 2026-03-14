import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError } from "@/lib/ai/ollama";
import { searchContentByKeywords } from "@/lib/db/queries/authentic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { topic?: string; level?: string };
    const topic = (body.topic ?? "").trim();
    if (!topic) {
      return NextResponse.json({ error: "Sujet manquant." }, { status: 400 });
    }

    const systemPrompt = `Tu es un assistant spécialisé dans la presse portugaise européenne.
Ton rôle : générer une liste de mots-clés en PORTUGAIS EUROPÉEN pour rechercher des articles sur un sujet donné.
Réponds UNIQUEMENT avec un JSON valide, sans texte autour.
Format : { "label": "Nom du thème en français (court, 2-3 mots)", "emoji": "un emoji approprié", "keywords": ["mot1", "mot2", ...15 mots max...] }
Les mots-clés doivent être en portugais européen (pas brésilien), en minuscules, sans accents manquants.`;

    const response = await ollamaChat(
      "general",
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Génère des mots-clés portugais européen pour rechercher des articles sur : "${topic}"`,
        },
      ],
      { temperature: 0.3, noCache: false }
    );

    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Réponse IA invalide. Réessayez." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      label?: string;
      emoji?: string;
      keywords?: string[];
    };

    const keywords = (parsed.keywords ?? []).slice(0, 15).map((k) => k.toLowerCase().trim());
    const label = parsed.label ?? topic;
    const emoji = parsed.emoji ?? "🔍";

    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "Aucun mot-clé généré. Essayez un autre sujet." },
        { status: 422 }
      );
    }

    // Récupérer les articles correspondants depuis la DB
    const level = body.level && body.level !== "all" ? body.level : undefined;
    const articles = searchContentByKeywords(keywords, 50, level);

    return NextResponse.json({ label, emoji, keywords, articles });
  } catch (error) {
    if (error instanceof OllamaError) {
      return NextResponse.json(
        { error: "Ollama indisponible. Vérifiez qu'il est démarré." },
        { status: 503 }
      );
    }
    console.error("Erreur ai-theme :", error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
