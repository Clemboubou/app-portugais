import { NextRequest, NextResponse } from "next/server";
import { ollamaChat } from "@/lib/ai/ollama";
import { PROMPT_PROFESSOR_INTERACTIVE } from "@/lib/ai/prompts";
import type { ProfessorData } from "@/components/professor/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProfessorRequest {
  question: string;
  history?: Message[];
}

export type ProfessorResponse = ProfessorData;

// Extraction robuste du premier objet JSON valide dans une chaîne
function extractFirstJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1)) as Record<string, unknown>;
        } catch { return null; }
      }
    }
  }
  return null;
}

const THEME_MAP: Record<string, string> = {
  vocabulary: "vocabulaire",
  grammar: "grammaire",
  conjugation: "conjugaison",
  translation: "traduction",
  pronunciation: "prononciation",
  expression: "expression",
  correction: "correction",
  culture: "culture",
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProfessorRequest;

    if (!body.question?.trim()) {
      return NextResponse.json({ error: "Question requise." }, { status: 400 });
    }

    const history = body.history ?? [];

    const messages = [
      { role: "system" as const, content: PROMPT_PROFESSOR_INTERACTIVE },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: body.question.trim() },
    ];

    const raw = await ollamaChat("grammar", messages, { noCache: true });

    const parsed = extractFirstJson(raw);

    if (!parsed) {
      return NextResponse.json({
        theme: "grammaire",
        title: "Réponse",
        rule: raw,
        examples: [],
      } satisfies ProfessorData);
    }

    const themeKey = (parsed.theme as string | undefined)?.toLowerCase() ?? "";
    if (THEME_MAP[themeKey]) parsed.theme = THEME_MAP[themeKey];

    return NextResponse.json(parsed as unknown as ProfessorData);
  } catch (error) {
    console.error("Erreur professor:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse." },
      { status: 500 }
    );
  }
}
