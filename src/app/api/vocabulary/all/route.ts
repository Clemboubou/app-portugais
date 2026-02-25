import { NextResponse } from "next/server";
import { getAllVocabulary } from "@/lib/db/queries/vocabulary";

export async function GET() {
  try {
    const items = getAllVocabulary();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erreur vocabulaire:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
