import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_EVALUATOR } from "@/lib/ai/prompts";

interface EvaluateRequest {
  transcript: string;
  scenario: string;
  level: string;
}

interface EvaluationResult {
  score: number | null;
  level: string | null;
  feedback: string;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EvaluateRequest;

    if (!body.transcript || !body.scenario || !body.level) {
      return NextResponse.json(
        { error: "Les champs 'transcript', 'scenario' et 'level' sont requis." },
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

    const userMessage = `Évalue cette conversation en portugais européen.
Scénario : ${body.scenario}
Niveau cible : ${body.level}

Transcription :
${body.transcript}

Réponds UNIQUEMENT en JSON valide avec les champs : score (0-100), level (A1/A2/B1/B2), feedback (string), errors (array of strings).`;

    const response = await ollamaChat("general", [
      { role: "system", content: PROMPT_EVALUATOR },
      { role: "user", content: userMessage },
    ]);

    // Tenter de parser le JSON
    try {
      // Extraire le JSON de la réponse (peut être entouré de markdown)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]) as EvaluationResult;
      return NextResponse.json({
        score: typeof parsed.score === "number" ? parsed.score : null,
        level: parsed.level ?? null,
        feedback: parsed.feedback ?? response,
        errors: Array.isArray(parsed.errors) ? parsed.errors : [],
      });
    } catch {
      // Fallback si JSON invalide
      return NextResponse.json({
        score: null,
        level: null,
        feedback: response,
        errors: [],
      });
    }
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
