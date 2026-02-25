/**
 * Analyse de prononciation côté client.
 * Compare le texte attendu avec la transcription Whisper.
 */

export interface PronunciationError {
  type: "missing" | "extra" | "wrong";
  expected: string;
  got: string;
  position: number;
}

export interface PronunciationAnalysis {
  score: number; // 0-100
  errors: PronunciationError[];
  expectedWords: string[];
  transcribedWords: string[];
  wordResults: Array<{ word: string; correct: boolean }>;
}

/**
 * Normalise un texte pour la comparaison (minuscules, sans accents diacritiques
 * de ponctuation, mais conserve les accents portugais significatifs).
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"""''«»\-–—()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenise un texte en mots.
 */
function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

/**
 * Distance de Levenshtein entre deux chaînes.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Score de similarité entre deux mots (0-1).
 */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

/**
 * Calcule un score de similarité global (0-100) entre le texte attendu
 * et la transcription.
 */
export function calculateSimilarity(
  expected: string,
  transcribed: string
): number {
  const expectedWords = tokenize(expected);
  const transcribedWords = tokenize(transcribed);

  if (expectedWords.length === 0) return transcribed.trim() === "" ? 100 : 0;
  if (transcribedWords.length === 0) return 0;

  // Score basé sur l'alignement des mots
  let matchScore = 0;
  let ei = 0;
  let ti = 0;

  while (ei < expectedWords.length && ti < transcribedWords.length) {
    const sim = wordSimilarity(expectedWords[ei], transcribedWords[ti]);
    if (sim >= 0.7) {
      matchScore += sim;
      ei++;
      ti++;
    } else {
      // Essayer de trouver un match plus loin
      const lookAhead = Math.min(3, transcribedWords.length - ti);
      let found = false;
      for (let k = 1; k <= lookAhead; k++) {
        if (
          ti + k < transcribedWords.length &&
          wordSimilarity(expectedWords[ei], transcribedWords[ti + k]) >= 0.7
        ) {
          ti += k;
          const s = wordSimilarity(expectedWords[ei], transcribedWords[ti]);
          matchScore += s;
          ei++;
          ti++;
          found = true;
          break;
        }
      }
      if (!found) {
        ei++;
      }
    }
  }

  // Score normalisé : mots correctement alignés / total attendus
  const rawScore = (matchScore / expectedWords.length) * 100;

  // Pénalité pour mots en trop
  const extraPenalty =
    Math.max(0, transcribedWords.length - expectedWords.length) * 3;

  return Math.max(0, Math.min(100, Math.round(rawScore - extraPenalty)));
}

/**
 * Identifie les erreurs de prononciation mot par mot.
 */
export function identifyErrors(
  expected: string,
  transcribed: string
): PronunciationError[] {
  const expectedWords = tokenize(expected);
  const transcribedWords = tokenize(transcribed);
  const errors: PronunciationError[] = [];

  let ei = 0;
  let ti = 0;

  while (ei < expectedWords.length || ti < transcribedWords.length) {
    if (ei >= expectedWords.length) {
      // Mots en trop dans la transcription
      errors.push({
        type: "extra",
        expected: "",
        got: transcribedWords[ti],
        position: ti,
      });
      ti++;
    } else if (ti >= transcribedWords.length) {
      // Mots manquants
      errors.push({
        type: "missing",
        expected: expectedWords[ei],
        got: "",
        position: ei,
      });
      ei++;
    } else {
      const sim = wordSimilarity(expectedWords[ei], transcribedWords[ti]);
      if (sim >= 0.85) {
        // Mot correct (ou très proche)
        ei++;
        ti++;
      } else if (sim >= 0.5) {
        // Mot déformé
        errors.push({
          type: "wrong",
          expected: expectedWords[ei],
          got: transcribedWords[ti],
          position: ei,
        });
        ei++;
        ti++;
      } else {
        // Possiblement un mot en trop ou manquant — regarder en avant
        const nextSim =
          ti + 1 < transcribedWords.length
            ? wordSimilarity(expectedWords[ei], transcribedWords[ti + 1])
            : 0;
        if (nextSim >= 0.7) {
          errors.push({
            type: "extra",
            expected: "",
            got: transcribedWords[ti],
            position: ti,
          });
          ti++;
        } else {
          errors.push({
            type: "missing",
            expected: expectedWords[ei],
            got: transcribedWords[ti] ?? "",
            position: ei,
          });
          ei++;
          ti++;
        }
      }
    }
  }

  return errors;
}

/**
 * Analyse complète de prononciation (score + erreurs + résultats mot par mot).
 */
export function analyzePronunciation(
  expected: string,
  transcribed: string
): PronunciationAnalysis {
  const expectedWords = tokenize(expected);
  const transcribedWords = tokenize(transcribed);
  const score = calculateSimilarity(expected, transcribed);
  const errors = identifyErrors(expected, transcribed);

  // Résultat mot par mot pour l'affichage coloré
  const wordResults = expectedWords.map((word, i) => {
    const hasError = errors.some(
      (e) => e.position === i && (e.type === "missing" || e.type === "wrong")
    );
    return { word, correct: !hasError };
  });

  return { score, errors, expectedWords, transcribedWords, wordResults };
}
