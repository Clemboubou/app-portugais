/**
 * Client Wiktionary pour le portugais européen.
 * Utilise l'API Wiktionary FR (fr.wiktionary.org) et Lingua Libre (Wikimedia Commons).
 */

interface WiktionaryDefinition {
  partOfSpeech: string;
  definitions: string[];
}

interface WiktionaryResult {
  word: string;
  phonetic: string;
  definitions: WiktionaryDefinition[];
  audioUrl: string | null;
  examples: string[];
  etymology: string | null;
}

/**
 * Recherche un mot sur Wiktionary FR.
 */
export async function lookupWiktionary(word: string): Promise<WiktionaryResult | null> {
  const normalizedWord = word.trim().toLowerCase();

  try {
    // 1. Récupérer la page Wiktionary FR via l'API parse
    const apiUrl = `https://fr.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(normalizedWord)}&prop=wikitext|categories&format=json&origin=*`;
    const response = await fetch(apiUrl);

    if (!response.ok) return null;

    const data = (await response.json()) as {
      parse?: {
        wikitext?: { "*"?: string };
        categories?: Array<{ "*"?: string }>;
      };
      error?: { code?: string };
    };

    if (data.error || !data.parse?.wikitext?.["*"]) {
      return null;
    }

    const wikitext = data.parse.wikitext["*"];

    // Vérifier que c'est bien du portugais
    if (!wikitext.includes("{{langue|pt}}")) {
      return null;
    }

    // 2. Extraire la section portugais
    const ptSection = extractPortugueseSection(wikitext);
    if (!ptSection) return null;

    // 3. Parser les informations
    const phonetic = extractPhonetic(ptSection);
    const definitions = extractDefinitions(ptSection);
    const examples = extractExamples(ptSection);
    const etymology = extractEtymology(ptSection);

    // 4. Chercher l'audio sur Lingua Libre / Commons
    const audioUrl = await findAudio(normalizedWord);

    return {
      word: normalizedWord,
      phonetic,
      definitions,
      audioUrl,
      examples,
      etymology,
    };
  } catch {
    return null;
  }
}

/**
 * Extrait la section portugais du wikitext.
 */
function extractPortugueseSection(wikitext: string): string | null {
  const ptStart = wikitext.indexOf("{{langue|pt}}");
  if (ptStart === -1) return null;

  // Trouver la fin (prochaine section de langue ou fin du texte)
  const nextLang = wikitext.indexOf("{{langue|", ptStart + 13);
  return nextLang === -1
    ? wikitext.substring(ptStart)
    : wikitext.substring(ptStart, nextLang);
}

/**
 * Extrait la prononciation IPA.
 */
function extractPhonetic(section: string): string {
  // Pattern: {{pron|...|pt}}
  const match = section.match(/\{\{pron\|([^|}]+)\|pt\}\}/);
  return match ? `/${match[1]}/` : "";
}

/**
 * Extrait les définitions par partie du discours.
 */
function extractDefinitions(section: string): WiktionaryDefinition[] {
  const results: WiktionaryDefinition[] = [];

  const posPatterns: Array<{ regex: RegExp; label: string }> = [
    { regex: /\{\{S\|nom\|pt/g, label: "Nom" },
    { regex: /\{\{S\|verbe\|pt/g, label: "Verbe" },
    { regex: /\{\{S\|adjectif\|pt/g, label: "Adjectif" },
    { regex: /\{\{S\|adverbe\|pt/g, label: "Adverbe" },
    { regex: /\{\{S\|préposition\|pt/g, label: "Préposition" },
    { regex: /\{\{S\|conjonction\|pt/g, label: "Conjonction" },
    { regex: /\{\{S\|pronom\|pt/g, label: "Pronom" },
    { regex: /\{\{S\|interjection\|pt/g, label: "Interjection" },
    { regex: /\{\{S\|article\|pt/g, label: "Article" },
  ];

  for (const { regex, label } of posPatterns) {
    const match = regex.exec(section);
    if (match) {
      const startIdx = match.index + match[0].length;
      // Extraire les lignes de définition (commencent par #)
      const afterSection = section.substring(startIdx);
      const defs: string[] = [];
      const lines = afterSection.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("# ") && !trimmed.startsWith("#*") && !trimmed.startsWith("##")) {
          // Nettoyer le wikitexte
          const cleaned = cleanWikitext(trimmed.substring(2));
          if (cleaned.length > 2) {
            defs.push(cleaned);
          }
        }
        // Arrêter si nouvelle section
        if (trimmed.startsWith("{{S|") && !trimmed.includes("flexion")) {
          break;
        }
      }

      if (defs.length > 0) {
        results.push({ partOfSpeech: label, definitions: defs.slice(0, 5) });
      }
    }
  }

  return results;
}

/**
 * Extrait les exemples d'usage.
 */
function extractExamples(section: string): string[] {
  const examples: string[] = [];
  const lines = section.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#* ") || trimmed.startsWith("#*''")) {
      const cleaned = cleanWikitext(trimmed.replace(/^#\*\s*/, ""));
      if (cleaned.length > 5) {
        examples.push(cleaned);
      }
    }
  }

  return examples.slice(0, 3);
}

/**
 * Extrait l'étymologie.
 */
function extractEtymology(section: string): string | null {
  const etymStart = section.indexOf("{{S|étymologie}}");
  if (etymStart === -1) return null;

  const afterEtym = section.substring(etymStart + 16);
  const lines = afterEtym.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(":") || (trimmed.length > 10 && !trimmed.startsWith("{{") && !trimmed.startsWith("=="))) {
      const cleaned = cleanWikitext(trimmed.replace(/^:\s*/, ""));
      if (cleaned.length > 5) return cleaned;
    }
    if (trimmed.startsWith("{{S|")) break;
  }

  return null;
}

/**
 * Nettoie le wikitext en texte lisible.
 */
function cleanWikitext(text: string): string {
  return text
    .replace(/\{\{lien\|([^|}]+)[^}]*\}\}/g, "$1") // {{lien|mot|...}} → mot
    .replace(/\{\{term\|([^|}]+)[^}]*\}\}/g, "($1)") // {{term|...}} → (...)
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2") // [[lien|texte]] → texte
    .replace(/\[\[([^\]]+)\]\]/g, "$1") // [[mot]] → mot
    .replace(/\{\{[^}]+\}\}/g, "") // supprimer les templates restants
    .replace(/''+/g, "") // supprimer italique/gras wiki
    .replace(/<[^>]+>/g, "") // supprimer HTML
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cherche un fichier audio sur Wikimedia Commons / Lingua Libre.
 */
async function findAudio(word: string): Promise<string | null> {
  try {
    // Chercher sur Commons avec le pattern classique pt-PT
    const patterns = [
      `Pt-${word}.ogg`,
      `Pt-pt-${word}.ogg`,
      `LL-Q5146 (por)-${word}.wav`,
    ];

    for (const filename of patterns) {
      const checkUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const res = await fetch(checkUrl);
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, {
            missing?: boolean;
            imageinfo?: Array<{ url?: string }>;
          }>;
        };
      };

      const pages = data.query?.pages;
      if (pages) {
        for (const page of Object.values(pages)) {
          if (!page.missing && page.imageinfo?.[0]?.url) {
            return page.imageinfo[0].url;
          }
        }
      }
    }

    // Recherche plus large via Lingua Libre
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=intitle:"${encodeURIComponent(word)}" incategory:"Lingua Libre pronunciation-pt"&srnamespace=6&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as {
      query?: { search?: Array<{ title?: string }> };
    };

    const firstResult = searchData.query?.search?.[0]?.title;
    if (firstResult) {
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(firstResult)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const infoRes = await fetch(infoUrl);
      const infoData = (await infoRes.json()) as {
        query?: { pages?: Record<string, { imageinfo?: Array<{ url?: string }> }> };
      };
      const infoPages = infoData.query?.pages;
      if (infoPages) {
        for (const page of Object.values(infoPages)) {
          if (page.imageinfo?.[0]?.url) {
            return page.imageinfo[0].url;
          }
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
