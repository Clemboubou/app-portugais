import Parser from "rss-parser";

interface RssItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  source: string;
}

interface FeedSource {
  name: string;
  url: string;
}

const PORTUGUESE_FEEDS: FeedSource[] = [
  { name: "RTP Notícias", url: "https://www.rtp.pt/noticias/rss/" },
  { name: "Público", url: "https://www.publico.pt/api/rss" },
  { name: "Observador", url: "https://observador.pt/feed/" },
  { name: "Jornal de Notícias", url: "https://www.jn.pt/rss" },
];

const parser = new Parser({
  customFields: {
    item: [["content:encoded", "contentEncoded"]],
  },
  timeout: 10_000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; RSS Reader)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tente de récupérer le texte complet d'un article en scrappant la page HTML.
 * Cherche les balises sémantiques communes : <article>, <main>, itemprop="articleBody".
 */
async function scrapeArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-PT,pt;q=0.9,fr;q=0.8",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) return "";

    const html = await res.text();

    // Priorité 1 : itemprop="articleBody"
    const articleBodyMatch = html.match(
      /itemprop=["']articleBody["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i
    );
    if (articleBodyMatch) {
      const text = stripHtml(articleBodyMatch[1]);
      if (text.length > 200) return text;
    }

    // Priorité 2 : balise <article>
    const articleTagMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleTagMatch) {
      const text = stripHtml(articleTagMatch[1]);
      if (text.length > 200) return text;
    }

    // Priorité 3 : classes communes de contenu d'article
    const classPatterns = [
      /class=["'][^"']*(?:article-body|article-content|article-text|entry-content|post-content|story-body|news-body|content-body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i,
    ];
    for (const pattern of classPatterns) {
      const match = html.match(pattern);
      if (match) {
        const text = stripHtml(match[1]);
        if (text.length > 200) return text;
      }
    }

    // Priorité 4 : extraire tous les <p> et concaténer
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m: RegExpExecArray | null;
    while ((m = pRegex.exec(html)) !== null) {
      const text = stripHtml(m[1]);
      if (text.length > 40) paragraphs.push(text);
    }
    if (paragraphs.length >= 3) {
      return paragraphs.join("\n\n");
    }

    return "";
  } catch {
    return "";
  }
}

const THEME_KEYWORDS: Record<string, string[]> = {
  desporto: [
    "futebol", "benfica", "sporting", "porto", "golo", "campeonato", "atlético",
    "jogo", "liga", "jogador", "treinador", "seleção", "torneio", "modalidade",
    "basquetebol", "ténis", "natação", "atletismo", "ciclismo", "andebol",
  ],
  politica: [
    "governo", "ministério", "partido", "eleição", "parlamento", "presidente",
    "república", "ministro", "deputado", "lei", "assembleia", "orçamento",
    "primeiro-ministro", "democracia", "voto", "coligação", "oposição",
  ],
  economia: [
    "economia", "banco", "mercado", "euro", "empresa", "investimento", "pib",
    "inflação", "bolsa", "exportação", "negócio", "desemprego", "crescimento",
    "finanças", "impostos", "budget", "receita", "startup", "comércio",
  ],
  cultura: [
    "cinema", "teatro", "música", "livro", "arte", "festival", "exposição",
    "museu", "espetáculo", "artista", "literatura", "fado", "pintura",
    "escultura", "arquitectura", "fotografia", "dança", "poesia",
  ],
  tecnologia: [
    "tecnologia", "digital", "app", "inteligência", "artificial", "computador",
    "software", "internet", "telemóvel", "robô", "dados", "inovação",
    "cibersegurança", "blockchain", "cloud", "programação",
  ],
  saude: [
    "saúde", "hospital", "doença", "médico", "vacina", "sns", "farmácia",
    "cancro", "epidemia", "tratamento", "paciente", "cirurgia", "diabetes",
    "pandemia", "vírus", "enfermeiro", "clínica", "medicamento",
  ],
  internacional: [
    "guerra", "onu", "eua", "trump", "europa", "mundo", "conflito", "nato",
    "ucrânia", "israel", "rússia", "china", "biden", "macron", "diplomacia",
    "sanções", "refugiados", "tratado",
  ],
};

export function detectTheme(text: string): string {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    scores[theme] = keywords.filter((kw) => lower.includes(kw)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "geral";
}

export function estimateLevel(text: string): "A1" | "A2" | "B1" | "B2" {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  if (sentences.length === 0) return "B1";
  const avgWords =
    sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) /
    sentences.length;
  if (avgWords <= 8) return "A2";
  if (avgWords <= 13) return "B1";
  return "B2";
}

export async function fetchRssFeed(
  source: FeedSource,
  limit = 10
): Promise<RssItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const rawItems = (feed.items ?? []).slice(0, limit);

    const items = await Promise.all(
      rawItems.map(async (item) => {
        // Contenu RSS (snippet)
        const rawContent =
          (item as unknown as Record<string, string>)["contentEncoded"] ??
          item.content ??
          item.contentSnippet ??
          "";
        const rssContent = stripHtml(rawContent);

        // Si le contenu RSS est court (< 300 chars), on scrape la page
        let fullContent = rssContent;
        const link = item.link ?? "";
        if (rssContent.length < 300 && link) {
          const scraped = await scrapeArticleContent(link);
          if (scraped.length > rssContent.length) {
            fullContent = scraped;
          }
        }

        return {
          title: stripHtml(item.title ?? ""),
          link,
          content: fullContent || rssContent,
          pubDate: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
          source: source.name,
        };
      })
    );

    return items.filter((item) => item.title && item.link);
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(limitPerFeed = 8): Promise<RssItem[]> {
  const results = await Promise.allSettled(
    PORTUGUESE_FEEDS.map((f) => fetchRssFeed(f, limitPerFeed))
  );
  const items: RssItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      items.push(...r.value);
    }
  }
  return items;
}

export type { RssItem };
