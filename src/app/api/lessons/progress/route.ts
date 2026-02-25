import { NextRequest, NextResponse } from "next/server";
import { saveProgress } from "@/lib/db/queries/progress";

interface ProgressRequest {
  lessonId: number;
  score: number;
  timeSpentSeconds: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProgressRequest;

    if (!body.lessonId || body.score === undefined) {
      return NextResponse.json(
        { error: "lessonId et score sont requis." },
        { status: 400 }
      );
    }

    const progress = saveProgress(
      body.lessonId,
      body.score,
      body.timeSpentSeconds ?? 0
    );

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Erreur sauvegarde progression:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
