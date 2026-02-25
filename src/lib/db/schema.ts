import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============================================================
// Niveaux CECRL (A1, A2, B1, B2)
// ============================================================
export const levels = sqliteTable("levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // "A1", "A2", "B1", "B2"
  name: text("name").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
});

// ============================================================
// Modules thématiques par niveau
// ============================================================
export const modules = sqliteTable("modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  levelId: integer("level_id")
    .notNull()
    .references(() => levels.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  isUnlocked: integer("is_unlocked", { mode: "boolean" }).notNull().default(false),
});

// ============================================================
// Leçons individuelles
// ============================================================
export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // vocabulary|grammar|listening|speaking|reading|writing|conversation|cultural|pronunciation
  contentJson: text("content_json").notNull(), // JSON stringifié { steps: [], exercises: [], vocabulary: [] }
  order: integer("order").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
});

// ============================================================
// Vocabulaire / Flashcards
// ============================================================
export const vocabularyItems = sqliteTable("vocabulary_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  portuguese: text("portuguese").notNull(),
  phonetic: text("phonetic").notNull(),
  french: text("french").notNull(),
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  level: text("level").notNull(), // "A1", "A2", "B1", "B2"
  frequency: integer("frequency").notNull().default(0),
  tags: text("tags").notNull().default("[]"), // JSON array stringifié
});

// ============================================================
// Cartes SRS (répétition espacée)
// ============================================================
export const srsCards = sqliteTable("srs_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull(),
  itemType: text("item_type").notNull(), // vocabulary|grammar|expression|conjugation
  state: integer("state").notNull().default(0), // 0=New, 1=Learning, 2=Review, 3=Relearning
  stability: real("stability").notNull().default(0),
  difficulty: real("difficulty").notNull().default(0),
  elapsedDays: integer("elapsed_days").notNull().default(0),
  scheduledDays: integer("scheduled_days").notNull().default(0),
  lastReview: text("last_review"), // ISO datetime
  nextReview: text("next_review").notNull(), // ISO datetime
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
});

// ============================================================
// Points de grammaire
// ============================================================
export const grammarPoints = sqliteTable("grammar_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  levelId: integer("level_id")
    .notNull()
    .references(() => levels.id),
  title: text("title").notNull(),
  explanationFr: text("explanation_fr").notNull(),
  examplesJson: text("examples_json").notNull().default("[]"), // JSON
  order: integer("order").notNull(),
});

// ============================================================
// Exercices liés aux leçons
// ============================================================
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id),
  type: text("type").notNull(), // fill_blank|mcq|transform|word_order|translation|error_detection|guided_production|dictation
  prompt: text("prompt").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  distractorsJson: text("distractors_json"), // JSON array pour QCM
  explanation: text("explanation").notNull(),
});

// ============================================================
// Progression de l'apprenant par leçon
// ============================================================
export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id),
  completedAt: text("completed_at").notNull(), // ISO datetime
  score: real("score").notNull(),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
});

// ============================================================
// Sessions de conversation orale
// ============================================================
export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scenario: text("scenario").notNull(),
  level: text("level").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  transcriptJson: text("transcript_json").notNull().default("[]"), // [{ role, content, timestamp }]
  score: real("score"),
  feedbackJson: text("feedback_json"),
});

// ============================================================
// Enregistrements vocaux
// ============================================================
export const recordings = sqliteTable("recordings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  audioPath: text("audio_path").notNull(),
  transcription: text("transcription"),
  score: real("score"),
  feedback: text("feedback"),
});

// ============================================================
// Contenu authentique (articles, podcasts)
// ============================================================
export const authenticContent = sqliteTable("authentic_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  source: text("source").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  level: text("level").notNull(),
  theme: text("theme"),
  savedAt: text("saved_at").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
});

// ============================================================
// Sessions d'étude
// ============================================================
export const studySessions = sqliteTable("study_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  itemsStudied: integer("items_studied").notNull().default(0),
  scoreAvg: real("score_avg"),
  sessionType: text("session_type").notNull(), // lesson|review|conversation|reading|listening
});

// ============================================================
// Journal d'erreurs récurrentes
// ============================================================
export const errorLog = sqliteTable("error_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  errorType: text("error_type").notNull(), // grammar|vocabulary|pronunciation|spelling
  context: text("context").notNull(),
  count: integer("count").notNull().default(1),
  lastSeen: text("last_seen").notNull(),
  srsCardId: integer("srs_card_id").references(() => srsCards.id),
});
