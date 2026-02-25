import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds, estimateLevel, detectTheme } from "@/lib/content/rss";
import { upsertAuthenticContent } from "@/lib/db/queries/authentic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      theme?: string;
    };
    const requestedTheme = body.theme;

    const items = await fetchAllFeeds(8);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Aucun article récupéré. Vérifiez la connexion internet." },
        { status: 503 }
      );
    }

    let saved = 0;
    for (const item of items) {
      const text = item.content || item.title;
      const level = estimateLevel(text);
      const theme = requestedTheme ?? detectTheme(item.title + " " + text);
      const result = upsertAuthenticContent({
        source: item.source,
        url: item.link,
        title: item.title,
        content: item.content,
        level,
        theme,
        savedAt: new Date(item.pubDate).toISOString(),
      });
      if (result) saved++;
    }

    return NextResponse.json({ fetched: items.length, saved });
  } catch (error) {
    console.error("Erreur fetch RSS :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des articles." },
      { status: 500 }
    );
  }
}
