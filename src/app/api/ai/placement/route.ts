import { NextRequest, NextResponse } from "next/server";
import { ollamaChat, OllamaError, checkOllamaHealth } from "@/lib/ai/ollama";
import { PROMPT_EVALUATOR } from "@/lib/ai/prompts";

interface AnswerRecord {
  questionId: string;
  given: string;
  correct: string;
}

interface PlacementRequest {
  answers: AnswerRecord[];
  level: string;
}

interface PlacementResult {
  detectedLevel: string;
  score: number;
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PlacementRequest;

    if (!body.answers || !body.level) {
      return NextResponse.json(
        { error: "Les champs 'answers' et 'level' sont requis." },
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

    const correctCount = body.answers.filter((a) => a.given === a.correct).length;
    const total = body.answers.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const wrongAnswers = body.answers
      .filter((a) => a.given !== a.correct)
      .map((a) => `Q:${a.questionId} — Donné: "${a.given}" / Correct: "${a.correct}"`)
      .join("\n");

    const userMessage = `Analyse les résultats d'un test de positionnement en portugais européen.
Niveau testé : ${body.level}
Score : ${correctCount}/${total} (${percentage}%)

Erreurs :
${wrongAnswers || "Aucune erreur"}

Réponds UNIQUEMENT en JSON valide avec les champs : detectedLevel (A1/A2/B1/B2), score (0-100), feedback (string en français).`;

    const response = await ollamaChat("general", [
      { role: "system", content: PROMPT_EVALUATOR },
      { role: "user", content: userMessage },
    ]);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]) as PlacementResult;
      return NextResponse.json({
        detectedLevel: parsed.detectedLevel ?? body.level,
        score: typeof parsed.score === "number" ? parsed.score : percentage,
        feedback: parsed.feedback ?? response,
      });
    } catch {
      return NextResponse.json({
        detectedLevel: body.level,
        score: percentage,
        feedback: response,
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
