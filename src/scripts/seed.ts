import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../lib/db/schema";
import * as fs from "fs";
import * as path from "path";

const dbPath = path.join(process.cwd(), "portugais.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

function findJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => path.join(dir, f));
}

interface ModuleData {
  id: number;
  levelCode: string;
  title: string;
  description: string;
  order: number;
}

interface VocabItem {
  portuguese: string;
  phonetic: string;
  french: string;
  level: string;
  frequency: number;
  tags: string[];
}

interface LessonExercise {
  type: string;
  prompt: string;
  correctAnswer: string;
  distractors?: string[];
  explanation: string;
}

interface LessonData {
  id: string;
  title: string;
  type: string;
  estimatedMinutes?: number;
  objectives: string[];
  steps: Array<{ type: string; title: string; content: string }>;
  exercises: LessonExercise[];
  vocabulary: Array<{ portuguese: string; phonetic: string; french: string }>;
}

const LEVELS_TO_SEED = ["A1", "A2", "B1", "B2", "C1"];

async function seed() {
  console.log("🌱 Début du seed...\n");

  // 0. Nettoyage préalable (évite les doublons si seed relancé)
  console.log("🧹 Nettoyage des données existantes...");
  sqlite.pragma("foreign_keys = OFF");
  for (const table of ["exercises", "user_progress", "srs_cards", "vocabulary_items", "recordings", "lessons", "modules", "levels"]) {
    sqlite.prepare(`DELETE FROM ${table}`).run();
  }
  sqlite.pragma("foreign_keys = ON");
  console.log("  ✓ Tables vidées\n");

  // 1. Insérer les niveaux CECRL
  console.log("📚 Insertion des niveaux CECRL...");
  const levelsData = [
    { code: "A1", name: "Débutant", description: "Alphabet, phonétique, présentations, chiffres, couleurs, famille, achats simples", order: 1 },
    { code: "A2", name: "Élémentaire", description: "Routines, transports, logement, loisirs, passé simple, futur immédiat", order: 2 },
    { code: "B1", name: "Intermédiaire", description: "Voyages, culture, travail, santé, subjonctif présent, conditionnel", order: 3 },
    { code: "B2", name: "Intermédiaire avancé", description: "Société, politique, littérature, presse, subjonctif passé, passif", order: 4 },
    { code: "C1", name: "Avancé", description: "Mésoclise, subjonctif futur, registres formels, culture littéraire, pragmatique avancée", order: 5 },
  ];

  for (const level of levelsData) {
    db.insert(schema.levels).values(level).onConflictDoNothing().run();
  }
  console.log(`  ✓ ${levelsData.length} niveaux insérés\n`);

  // 2. Récupérer les IDs des niveaux
  const levelRows = db.select().from(schema.levels).all();
  const levelMap = new Map(levelRows.map((l) => [l.code, l.id]));

  const contentDir = path.join(process.cwd(), "content");
  let totalLessons = 0;
  let totalExercises = 0;
  let totalModules = 0;

  // 3. Insérer les modules et leçons pour chaque niveau
  for (const levelCode of LEVELS_TO_SEED) {
    const modulesFile = path.join(contentDir, "curriculum", levelCode, "modules.json");

    if (!fs.existsSync(modulesFile)) {
      console.log(`⚠️  Pas de modules.json pour ${levelCode}, skipping...`);
      continue;
    }

    console.log(`📦 Insertion des modules ${levelCode}...`);
    const modulesData = readJson<ModuleData[]>(modulesFile);
    const moduleDbIds = new Map<number, number>();

    for (const mod of modulesData) {
      const levelId = levelMap.get(mod.levelCode);
      if (!levelId) continue;

      const result = db.insert(schema.modules).values({
        levelId,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        isUnlocked: mod.order === 1,
      }).returning().get();

      moduleDbIds.set(mod.id, result.id);
      totalModules++;
    }
    console.log(`  ✓ ${modulesData.length} modules insérés`);

    // 4. Insérer les leçons
    console.log(`📖 Insertion des leçons ${levelCode}...`);
    let levelLessonCount = 0;
    let levelExerciseCount = 0;

    for (const mod of modulesData) {
      const moduleDbId = moduleDbIds.get(mod.id);
      if (!moduleDbId) continue;

      const lessonsDir = path.join(contentDir, "curriculum", levelCode, "lessons", `module-${mod.order}`);
      const lessonFiles = findJsonFiles(lessonsDir);

      for (let i = 0; i < lessonFiles.length; i++) {
        const lessonData = readJson<LessonData>(lessonFiles[i]);

        const lessonResult = db.insert(schema.lessons).values({
          moduleId: moduleDbId,
          title: lessonData.title,
          type: lessonData.type,
          contentJson: JSON.stringify({
            objectives: lessonData.objectives,
            steps: lessonData.steps,
            vocabulary: lessonData.vocabulary,
          }),
          order: i + 1,
          estimatedMinutes: lessonData.estimatedMinutes ?? 10,
        }).returning().get();

        levelLessonCount++;

        // Insérer les exercices de cette leçon
        for (const ex of lessonData.exercises) {
          db.insert(schema.exercises).values({
            lessonId: lessonResult.id,
            type: ex.type,
            prompt: ex.prompt,
            correctAnswer: ex.correctAnswer,
            distractorsJson: ex.distractors ? JSON.stringify(ex.distractors) : null,
            explanation: ex.explanation,
          }).run();
          levelExerciseCount++;
        }
      }
    }
    console.log(`  ✓ ${levelLessonCount} leçons insérées`);
    console.log(`  ✓ ${levelExerciseCount} exercices insérés\n`);
    totalLessons += levelLessonCount;
    totalExercises += levelExerciseCount;
  }

  // 5. Insérer le vocabulaire pour chaque niveau
  for (const levelCode of LEVELS_TO_SEED) {
    const vocabFile = path.join(contentDir, "vocabulary", `${levelCode}.json`);
    if (fs.existsSync(vocabFile)) {
      console.log(`🔤 Insertion du vocabulaire ${levelCode}...`);
      const vocabData = readJson<VocabItem[]>(vocabFile);

      for (const word of vocabData) {
        db.insert(schema.vocabularyItems).values({
          portuguese: word.portuguese,
          phonetic: word.phonetic,
          french: word.french,
          level: word.level,
          frequency: word.frequency,
          tags: JSON.stringify(word.tags),
        }).run();
      }
      console.log(`  ✓ ${vocabData.length} mots insérés\n`);
    }
  }

  console.log("─────────────────────────────────");
  console.log(`✅ Seed terminé avec succès !`);
  console.log(`   ${totalModules} modules · ${totalLessons} leçons · ${totalExercises} exercices`);
  sqlite.close();
}

seed().catch((err) => {
  console.error("❌ Erreur lors du seed:", err);
  process.exit(1);
});
