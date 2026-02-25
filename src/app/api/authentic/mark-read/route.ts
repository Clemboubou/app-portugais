import { NextRequest, NextResponse } from "next/server";
import { markAsRead } from "@/lib/db/queries/authentic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { id: number };
    if (!body.id) {
      return NextResponse.json(
        { error: "Le champ 'id' est requis." },
        { status: 400 }
      );
    }
    markAsRead(body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur mark-read :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
