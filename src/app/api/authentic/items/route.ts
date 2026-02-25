import { NextRequest, NextResponse } from "next/server";
import { getAuthenticContent } from "@/lib/db/queries/authentic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? undefined;
  const theme = searchParams.get("theme") ?? undefined;
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  try {
    const items = getAuthenticContent(limit, level, theme);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erreur items authentic :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
