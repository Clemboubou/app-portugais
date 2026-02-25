/**
 * Ajoute les vrais mots de vocabulaire manquants qu'on a identifiés
 * (pas les conjugaisons, pas les articles/prép ultra-basiques)
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";
import * as path from "path";

const dbPath = path.join(process.cwd(), "portugais.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

// Vrais mots importants manquants : (portuguese, french, level, frequency, tags)
const MISSING_WORDS: Array<[string, string, string, number, string[]]> = [
  // Très basique A1
  ["água", "eau", "A1", 95, ["nourriture", "nature"]],
  ["muito", "beaucoup / très", "A1", 95, ["adverbes", "adjectifs"]],
  ["mais", "plus", "A1", 90, ["adverbes", "quantités"]],
  ["menos", "moins", "A1", 88, ["adverbes", "quantités"]],
  ["pouco", "peu", "A1", 85, ["adverbes", "quantités"]],
  ["onde", "où", "A1", 92, ["adverbes", "questions"]],
  ["quando", "quand", "A1", 92, ["adverbes", "temps"]],
  ["quem", "qui / quel est ce / qui est-ce", "A1", 88, ["adverbes", "questions"]],
  ["que", "que / quel / quoi", "A1", 90, ["pronoms", "conjonctions"]],
  ["como", "comment / comme", "A1", 90, ["adverbes", "questions"]],
  ["porque", "parce que", "A1", 88, ["conjonctions"]],
  ["sem", "sans", "A1", 88, ["prépositions"]],
  ["sobre", "sur / à propos de / environ", "A1", 85, ["prépositions"]],
  ["então", "alors / donc / si", "A1", 85, ["adverbes", "conjonctions"]],
  ["já", "déjà / maintenant / par exemple", "A1", 90, ["adverbes"]],
  ["tão", "si / aussi / tellement", "A1", 82, ["adverbes"]],
  ["lhe", "à lui / à elle (complément indirect)", "A1", 88, ["pronoms"]],
  ["lhes", "à eux / à elles (complément indirect)", "A1", 85, ["pronoms"]],

  // Verbes très communs
  ["fazer", "faire / fabriquer", "A1", 98, ["verbes", "actions"]],
  ["ver", "voir / regarder", "A1", 98, ["verbes", "actions"]],
  ["vir", "venir", "A1", 92, ["verbes", "actions"]],
  ["chegar", "arriver / atteindre", "A1", 90, ["verbes", "actions", "mouvement"]],
  ["chamar", "appeler / nommer", "A1", 88, ["verbes", "actions"]],
  ["dever", "devoir / doit", "A1", 90, ["verbes", "obligation"]],
  ["tentar", "essayer / tenter", "A2", 82, ["verbes", "actions"]],
  ["tratar", "traiter / soigner", "A2", 78, ["verbes", "actions"]],
  ["parecer", "sembler / paraître", "A2", 82, ["verbes", "perception"]],
  ["olhar", "regarder / jeter un oeil", "A1", 88, ["verbes", "perception"]],
  ["ouvir", "entendre / écouter", "A1", 90, ["verbes", "perception"]],
  ["correr", "courir", "A1", 85, ["verbes", "actions", "mouvement"]],
  ["cortar", "couper / trancher", "A1", 85, ["verbes", "actions"]],
  ["morrer", "mourir", "A2", 80, ["verbes", "vie"]],
  ["acontecer", "arriver / se passer / advenir", "A2", 82, ["verbes", "actions"]],
  ["casar", "marier / se marier", "A2", 80, ["verbes", "famille"]],
  ["explicar", "expliquer / clarifier", "A2", 82, ["verbes", "communication"]],

  // Adjectifs très communs
  ["quente", "chaud / tiède", "A1", 88, ["adjectifs", "temperature"]],
  ["frio", "froid / frais", "A1", 88, ["adjectifs", "température"]],
  ["rápido", "rapide / vite", "A1", 88, ["adjectifs", "adverbes"]],
  ["morto", "mort / décédé", "A2", 75, ["adjectifs"]],
  ["vivo", "vivant / en direct", "A2", 78, ["adjectifs"]],
  ["seguro", "sûr / certain / en sécurité", "A2", 80, ["adjectifs"]],
  ["perfeito", "parfait / idéal", "A2", 80, ["adjectifs"]],
  ["possível", "possible / faisable", "A2", 82, ["adjectifs"]],
  ["ruim", "mauvais (BR) / nul", "A2", 72, ["adjectifs"]],
  ["sério", "sérieux / grave", "A2", 78, ["adjectifs"]],
  ["tímido", "timide / réservé", "A2", 72, ["adjectifs", "personnalité"]],
  ["leve", "léger / bénin / doux", "A2", 72, ["adjectifs"]],
  ["pessoal", "personnel / staff / équipe", "A2", 78, ["adjectifs", "divers"]],
  ["mentiroso", "mensonger / menteur", "A2", 68, ["adjectifs", "personnalité"]],

  // Nouns communs manqués
  ["comida", "nourriture / mets / repas", "A1", 88, ["nourriture", "divers"]],
  ["coisa", "chose / affaire / truc", "A1", 88, ["divers"]],
  ["cavalo", "cheval", "A2", 78, ["animaux"]],
  ["polvo", "poulpe / pieuvre", "A2", 72, ["animaux", "mer", "nourriture"]],
  ["caranguejo", "crabe", "A2", 72, ["animaux", "mer", "nourriture"]],
  ["cebola", "oignon", "A1", 82, ["nourriture", "légumes"]],
  ["chave", "clé / clef", "A2", 82, ["objets"]],
  ["chefe", "chef / patron / directeur", "A2", 82, ["métiers", "travail"]],
  ["filme", "film / cinéma", "A2", 88, ["culture", "divertissement"]],
  ["porta", "porte / portail", "A1", 88, ["maison", "lieux"]],
  ["quarto", "chambre / quartier / quart", "A1", 88, ["maison", "divers"]],
  ["parabéns", "félicitations / bravo", "A2", 75, ["expressions", "divers"]],
  ["prazer", "plaisir / satisfaction", "A2", 78, ["émotions", "divers"]],
  ["presidente", "président / présidente", "A2", 80, ["métiers", "politique"]],
  ["senhor", "monsieur / seigneur / homme", "A1", 90, ["titres", "personnes"]],
  ["senhora", "madame / dame / femme", "A1", 90, ["titres", "personnes"]],
  ["saída", "sortie / issue / départ", "A2", 80, ["divers", "lieux"]],
  ["certeza", "certitude / certaines", "A2", 82, ["divers", "émotions"]],
  ["chamada", "appel / coup de téléphone", "A2", 75, ["communication", "technologie"]],
  ["cliente", "client / cliente", "A2", 82, ["travail", "commerce"]],
  ["colar", "collier / colle / coller", "A2", 72, ["vêtements", "objets"]],
  ["doutor", "docteur / médecin / Dr", "A2", 82, ["métiers", "titres"]],
  ["favor", "faveur / service / s'il vous plaît", "A1", 82, ["divers", "politesse"]],
  ["feira", "foire / marché / fête foraine", "A2", 68, ["lieux", "événements"]],
  ["mal", "mal / mauvais / vilain (adverbe/nom)", "A1", 82, ["adverbes", "adjectifs"]],
  ["marinheiro", "marin / navigateur", "A2", 72, ["métiers", "navires"]],
  ["meio", "moitié / milieu / moyen / moyen (adv)", "A2", 80, ["divers", "quantités"]],
  ["mim", "moi (après préposition)", "A1", 82, ["pronoms"]],
  ["nem", "ni / ni...ni", "A1", 88, ["conjonctions"]],
  ["raio", "éclair / rayon / zut !", "B1", 65, ["nature", "argot"]],
  ["whisky", "whisky / scotch", "A2", 70, ["boissons", "alcool"]],
  ["óptimo", "excellent / magnifique / optimal", "A2", 80, ["adjectifs"]],
  ["tipo", "type / genre / mec / gars", "A2", 78, ["divers", "argot"]],
  ["bar", "bar / comptoir / barre", "A1", 85, ["lieux", "boissons"]],
  ["altura", "hauteur / taille / époque / moment", "A2", 78, ["divers", "mesures"]],
  ["basicamente", "fondamentalement / essentiellement", "B1", 65, ["adverbes"]],
  ["qual", "quel / quelle / lequel / laquelle", "A1", 88, ["pronoms", "questions"]],
  ["quase", "presque / quasi", "A1", 88, ["adverbes"]],
  ["oi", "salut / coucou (BR familier)", "A1", 78, ["salutations"]],
  ["ok", "d'accord / OK", "A1", 82, ["interjections"]],
  ["oh", "oh / oh là là", "A1", 72, ["interjections"]],
  ["teu", "ton / ta (masc)", "A1", 85, ["pronoms", "possessifs"]],
  ["tua", "ta / ton (fém)", "A1", 85, ["pronoms", "possessifs"]],
  ["vão", "ils vont / vous allez (vos allez)", "A1", 85, ["verbes"]],
  ["marinheiro", "marin / matelot", "A2", 72, ["métiers"]],
];

async function addWords() {
  console.log(`📚 ${MISSING_WORDS.length} mots à ajouter...`);
  let inserted = 0;
  let skipped = 0;

  for (const [portuguese, french, level, frequency, tags] of MISSING_WORDS) {
    const existing = db
      .select({ id: schema.vocabularyItems.id })
      .from(schema.vocabularyItems)
      .where(eq(schema.vocabularyItems.portuguese, portuguese))
      .get();

    if (existing) {
      skipped++;
      continue;
    }

    db.insert(schema.vocabularyItems)
      .values({
        portuguese,
        phonetic: "",
        french,
        level,
        frequency,
        tags: JSON.stringify(tags),
      })
      .run();
    inserted++;
  }

  console.log(`✅ ${inserted} mots insérés`);
  console.log(`⏭️  ${skipped} doublons ignorés`);
  sqlite.close();
}

addWords().catch((err) => {
  console.error("❌ Erreur :", err);
  process.exit(1);
});
