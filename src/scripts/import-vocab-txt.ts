/**
 * Script d'import du vocabulaire depuis vocabulaire.txt
 * - Déduplique vs la DB existante
 * - Filtre les mots brésiliens, formes conjuguées, mots grammaticaux
 * - Utilise Ollama par lots de 20 mots pour traduction + phonétique + niveau CECRL
 * - Insère en DB
 *
 * Usage : npx tsx src/scripts/import-vocab-txt.ts
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../lib/db/schema";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(process.cwd(), "portugais.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

// ─── Mots brésiliens ──────────────────────────────────────────────────────────
const BRAZILIAN_WORDS = new Set([
  "ônibus","bebê","garçom","xícara","sorvete","suco","camiseta",
  "macarrão","você","vocês","banheiro","celular","ótimo","trem",
  "mouse","pra","ok",
]);

// ─── Mots grammaticaux purs ───────────────────────────────────────────────────
const GRAMMAR_WORDS = new Set([
  "a","ao","aos","as","da","das","de","do","dos","e","em",
  "na","nas","no","nos","o","os","ou","por","pelo","pela","pelos","pelas",
  "para","com","sem","sob","sobre","entre","até","desde","contra","após",
  "perante","mediante","eu","tu","ele","ela","nós","vós","eles","elas",
  "me","te","lhe","lhes","lo","la","los","las","se","nos","vos","si",
  "um","uma","uns","umas",
  "que","quem","qual","quais","quando","onde","como",
  "mas","porém","pois","porque","embora","enquanto",
  "ah","ai","ei","oh","oi","ok","nao",
  "em conclusão","em suma","por conseguinte","dessa forma","desse modo",
]);

// ─── Formes conjuguées à ignorer ─────────────────────────────────────────────
const CONJUGATED_FORMS = new Set([
  // achar
  "acho","achas","acha","achei",
  // acreditar
  "acredita","acredito",
  // acontecer
  "acontece","aconteceu",
  // ajudar
  "ajuda",
  // andar
  "anda",
  // começar
  "começou",
  // conseguir
  "consegue","consegues","consegui","conseguimos","conseguiu","consigo",
  // conhecer
  "conhece","conheço",
  // chamar
  "chama","chamo",
  // chegar
  "chega","chegou",
  // dar
  "dou","dei","dá","dê",
  // dever
  "deve","devem","devemos","deves","devia","devias","devo","devíamos","deveria",
  // dizer
  "digo","diz","dizem","dizes","disse","disseram","disseste","dito","digas","diga",
  // entrar
  "entra",
  // escutar
  "escuta",
  // esperar
  "espera","espero","espere","esperem",
  // estar
  "estou","está","estamos","estão","estás","estava","estavam","estavas","estávamos",
  "estive","esteve","estiver","estivesse","esteja",
  // fazer
  "faz","fazes","fazem","fazemos","fazendo","fazia","faço","faças","faça",
  "fez","fizemos","fizeram","fizeste","fazê",
  // falar
  "fala","falando","falei","falou",
  // ficar
  "fica","fico","ficou","fique","fiquei",
  // gostar
  "gosta","gosto","gostas","gostava","gostaria",
  // haver
  "há","havia","houve",
  // ir
  "vou","vai","vais","vamos","vão","ia","iria","indo","irá",
  // lembrar
  "lembra","lembro","lembras",
  // levar
  "leva","levou","leve",
  // ligar
  "liga",
  // olhar
  "olha","olho","olhe","olhem",
  // ouvir
  "ouve","ouvi","ouviste","ouça",
  // pedir
  "pediu","peço",
  // pensar
  "pensa","penso","pensas","pensava","pensei",
  // perguntar
  "pergunta","perguntas",
  // poder
  "pode","podem","podemos","podes","podia","poderia",
  // procurar
  "procura",
  // querer
  "quer","queres","querem","queremos","queria","quero","quis","quiser","quiseres",
  // saber
  "sei","sabe","sabes","sabem","sabemos","sabia","soube",
  // sair
  "sai","saia","saiam","saiu",
  // ser
  "sou","és","é","somos","são","era","eram","foi","fomos","foram","fosse","sido",
  // sentir
  "sinto","sente",
  // ter
  "tenho","tens","tem","temos","têm","tinha","tinhas","tinham","teve","tive","tivesse","tenha",
  // tomar
  "toma",
  // trazer
  "trouxe",
  // ver
  "vejo","vês","vê","viu","vi","veja",
  // vir
  "vem","vim","vindo","veio","venha","venho",
  // voltar
  "volta","volto","voltou",
  // deixar
  "deixa","deixe","deixem","deixou",
  // continuar
  "continua",
  // parar
  "pare","parem",
  // passar
  "passa","passou","passo",
  // interessa
  "interessa",
  // calar
  "cala",
  // posso/possa
  "posso","possa",
  // tratar
  "trata",
  // trabalhar
  "trabalha",
  // creio
  "creio",
  // começar
  "começa",
  // acabar
  "acabei","acabou",
  // acreditar
  "acreditas",
  // forma conjugada de ter
  "tive",
  // viver
  "vivo",
  // morar
  "mora",
]);

// ─── Vulgaire / inapproprié ───────────────────────────────────────────────────
const VULGAR = new Set([
  "foda","porra","merda","puta","caralho","idiota","estúpido","droga",
  "diabo","diabos","inferno","raio","raios","bolas","sexo",
]);

// ─── Autres à ignorer ─────────────────────────────────────────────────────────
const MISC_SKIP = new Set([
  "David","david","hodiernamente","irrelevantemente","insignificantemente",
  "regozijadamente","reduzidamente","resumidamente","sumariamente",
  "contemporaneamente","nao","whisky","la","las","lo","los","fazê",
]);

// ─── Lecture du fichier ────────────────────────────────────────────────────────
const vocabFilePath = path.join(process.cwd(), "..", "vocabulaire.txt");
if (!fs.existsSync(vocabFilePath)) {
  console.error(`❌ Fichier non trouvé : ${vocabFilePath}`);
  process.exit(1);
}

const rawWords = fs.readFileSync(vocabFilePath, "utf-8")
  .split("\n")
  .map(w => w.trim())
  .filter(w => w.length > 0);

console.log(`📄 ${rawWords.length} mots lus depuis vocabulaire.txt\n`);

// ─── Mots déjà en DB ─────────────────────────────────────────────────────────
const existingWords = new Set(
  db.select({ portuguese: schema.vocabularyItems.portuguese })
    .from(schema.vocabularyItems)
    .all()
    .map(r => r.portuguese.toLowerCase())
);

console.log(`💾 ${existingWords.size} mots déjà en DB`);

// ─── Filtrage pré-Ollama ──────────────────────────────────────────────────────
const toImport: string[] = [];
let filteredCount = 0;

for (const word of rawWords) {
  const lower = word.toLowerCase();

  if (existingWords.has(lower)
    || BRAZILIAN_WORDS.has(lower)
    || GRAMMAR_WORDS.has(lower)
    || CONJUGATED_FORMS.has(lower)
    || VULGAR.has(lower)
    || MISC_SKIP.has(lower)
    || word.length < 2
  ) {
    filteredCount++;
    continue;
  }

  toImport.push(word);
}

console.log(`🔍 ${toImport.length} mots candidats après filtrage (${filteredCount} ignorés)`);
if (toImport.length === 0) {
  console.log("✅ Rien à importer.");
  sqlite.close();
  process.exit(0);
}

// ─── Ollama par lots ──────────────────────────────────────────────────────────
const OLLAMA_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL_GENERAL ?? "mistral";
const BATCH_SIZE = 20;

interface OllamaResult {
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  skip?: boolean;
}

async function ollamaBatch(words: string[]): Promise<OllamaResult[]> {
  const prompt = `Tu es expert en portugais européen (PT-PT, Lisbonne).
Pour chaque mot de cette liste, fournis en JSON :
- "portuguese" : le mot (infinitif pour les verbes)
- "phonetic" : prononciation simplifiée (ex: "ka-ZA", "pesh" etc.)
- "french" : traduction française courte
- "level" : niveau CECRL parmi A1 A2 B1 B2 C1
- "skip" : true si c'est une forme conjuguée, pronom, article, préposition, mot brésilien, ou mot vulgaire

Réponds UNIQUEMENT avec un tableau JSON, sans markdown.
Mots : ${JSON.stringify(words)}`;

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { num_ctx: 4096, temperature: 0.1 },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { message: { content: string } };
  const text = data.message.content;
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Pas de JSON array dans la réponse");
  return JSON.parse(match[0]) as OllamaResult[];
}

// ─── Import ───────────────────────────────────────────────────────────────────
async function main() {
  let inserted = 0;
  let skippedOllama = 0;
  let batchErrors = 0;
  const VALID_LEVELS = new Set(["A1","A2","B1","B2","C1"]);

  console.log(`\n🚀 Début de l'import par lots de ${BATCH_SIZE} via Ollama (${MODEL})...\n`);

  for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
    const batch = toImport.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toImport.length / BATCH_SIZE);

    process.stdout.write(`\r📦 Lot ${batchNum}/${totalBatches} — ${inserted} insérés jusqu'ici...`);

    try {
      const results = await ollamaBatch(batch);

      for (const r of results) {
        if (r.skip || !r.portuguese || !r.french) {
          skippedOllama++;
          continue;
        }
        if (existingWords.has(r.portuguese.toLowerCase())) {
          skippedOllama++;
          continue;
        }

        try {
          db.insert(schema.vocabularyItems).values({
            portuguese: r.portuguese.trim(),
            phonetic: (r.phonetic ?? "").trim(),
            french: r.french.trim(),
            level: VALID_LEVELS.has(r.level) ? r.level : "A2",
            frequency: 0,
            tags: "[]",
          }).run();

          existingWords.add(r.portuguese.toLowerCase());
          inserted++;
        } catch {
          skippedOllama++;
        }
      }
    } catch (err) {
      batchErrors++;
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`\n  ⚠️  Erreur lot ${batchNum}: ${msg}\n`);
      await new Promise(r => setTimeout(r, 3000));
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n\n─────────────────────────────────`);
  console.log(`✅ Import terminé !`);
  console.log(`   ${inserted} nouveaux mots insérés`);
  console.log(`   ${skippedOllama} ignorés par Ollama`);
  console.log(`   ${filteredCount} filtrés avant Ollama`);
  if (batchErrors > 0) console.log(`   ⚠️  ${batchErrors} erreurs de lot`);

  const total = db.select({ c: schema.vocabularyItems.portuguese })
    .from(schema.vocabularyItems).all().length;
  console.log(`\n   📚 Total vocabulaire en DB : ${total} mots`);

  sqlite.close();
}

main().catch(err => {
  console.error("❌ Erreur fatale:", err);
  sqlite.close();
  process.exit(1);
});
