import { NextResponse } from "next/server";
import { getOverviewStats } from "@/lib/db/queries/stats";

export async function GET() {
  try {
    const stats = getOverviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur stats :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
