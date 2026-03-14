export type ProfessorTheme =
  | "conjugaison"
  | "grammaire"
  | "vocabulaire"
  | "traduction"
  | "prononciation"
  | "expression"
  | "correction"
  | "culture";

export interface ProfessorExample {
  pt: string;
  fr: string;
}

// ── Conjugaison ─────────────────────────────────────────────
export interface ConjugaisonData {
  theme: "conjugaison";
  verb: string;
  tense: string;
  isIrregular: boolean;
  forms: { pronoun: string; form: string }[];
  note?: string;
  examples: ProfessorExample[];
}

// ── Grammaire ────────────────────────────────────────────────
export interface GrammaireData {
  theme: "grammaire";
  title: string;
  rule: string;
  comparison?: {
    leftLabel: string;
    rightLabel: string;
    leftItems: string[];
    rightItems: string[];
  };
  examples: ProfessorExample[];
}

// ── Vocabulaire ──────────────────────────────────────────────
export interface VocabulaireData {
  theme: "vocabulaire";
  word: string;
  ipa: string;
  gender?: string;
  partOfSpeech: string;
  definition: string;
  relatedWords?: string[];
  examples: ProfessorExample[];
}

// ── Traduction ───────────────────────────────────────────────
export interface TraductionData {
  theme: "traduction";
  french: string;
  translations: { register: string; pt: string }[];
  note?: string;
  examples: ProfessorExample[];
}

// ── Prononciation ────────────────────────────────────────────
export interface PrononciationData {
  theme: "prononciation";
  sound: string;
  ipa: string;
  rule: string;
  wordExamples: { word: string; ipa: string }[];
  examples: ProfessorExample[];
}

// ── Expression ───────────────────────────────────────────────
export interface ExpressionData {
  theme: "expression";
  expression: string;
  literalMeaning: string;
  realMeaning: string;
  context: string;
  examples: ProfessorExample[];
}

// ── Correction ───────────────────────────────────────────────
export interface CorrectionData {
  theme: "correction";
  wrong: string;
  correct: string;
  rule: string;
  explanation: string;
  examples: ProfessorExample[];
}

// ── Culture ──────────────────────────────────────────────────
export interface CultureData {
  theme: "culture";
  title: string;
  context: string;
  usageTable?: { situation: string; form: string }[];
  examples: ProfessorExample[];
}

export type ProfessorData =
  | ConjugaisonData
  | GrammaireData
  | VocabulaireData
  | TraductionData
  | PrononciationData
  | ExpressionData
  | CorrectionData
  | CultureData;
