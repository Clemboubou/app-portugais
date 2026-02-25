import { NextRequest, NextResponse } from "next/server";
import { lookupWiktionary } from "@/lib/content/wiktionary";
import { ollamaChat, checkOllamaHealth } from "@/lib/ai/ollama";

export async function GET(request: NextRequest) {
  try {
    const word = request.nextUrl.searchParams.get("word");

    if (!word || word.trim().length === 0) {
      return NextResponse.json(
        { error: "Le paramètre 'word' est requis." },
        { status: 400 }
      );
    }

    const normalizedWord = word.trim().toLowerCase();

    // 1. Essayer Wiktionary en premier
    const wiktResult = await lookupWiktionary(normalizedWord);
    if (wiktResult) {
      return NextResponse.json({ ...wiktResult, source: "wiktionary" });
    }

    // 2. Fallback : Ollama (génère une définition structurée)
    const isHealthy = await checkOllamaHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: `Mot "${word}" non trouvé et Ollama non disponible.` },
        { status: 404 }
      );
    }

    const prompt = `L'utilisateur cherche le mot : "${normalizedWord}".

Ta mission :
1. Si le mot est en français, trouve son équivalent en portugais EUROPÉEN (variante de Lisbonne).
   Ex : "commentaire" → "comentário", "maison" → "casa", "voiture" → "carro"
2. Si le mot est déjà en portugais, utilise-le directement.
3. Dans tous les cas, le champ "word" DOIT contenir le mot en PORTUGAIS européen.

Réponds UNIQUEMENT en JSON valide avec ce format exact, sans texte avant ni après :
{
  "word": "MOT_EN_PORTUGAIS",
  "phonetic": "/phonétique IPA portugais/",
  "definitions": [
    { "partOfSpeech": "Nom/Verbe/Adjectif/etc", "definitions": ["traduction et définition en français"] }
  ],
  "audioUrl": null,
  "examples": [
    { "pt": "phrase exemple en portugais européen", "fr": "traduction française de la phrase" }
  ],
  "etymology": "origine étymologique en français (ou null)",
  "source": "ollama"
}`;

    const raw = await ollamaChat("general", [
      { role: "user", content: prompt },
    ]);

    // Parser le JSON retourné par Ollama
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      parsed.source = "ollama";
      return NextResponse.json(parsed);
    }

    return NextResponse.json(
      { error: `Mot "${word}" non trouvé.` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Erreur dictionnaire:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
