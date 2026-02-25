/**
 * FSRS-4.5 — Free Spaced Repetition Scheduler
 * Implémentation TypeScript pure basée sur :
 * https://github.com/open-spaced-repetition/fsrs4anki
 */

export enum Rating {
  Again = 1,
  Hard = 2,
  Good = 3,
  Easy = 4,
}

export enum State {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

export interface Card {
  state: State;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview: Date | null;
  nextReview: Date;
}

export interface ReviewLog {
  rating: Rating;
  state: State;
  elapsedDays: number;
  scheduledDays: number;
  review: Date;
}

export interface SchedulingResult {
  card: Card;
  log: ReviewLog;
}

// Paramètres par défaut FSRS-4.5 (17 paramètres)
const DEFAULT_PARAMS = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
  0.34, 1.26, 0.29, 2.61,
];

const DESIRED_RETENTION = 0.9;
const DECAY = -0.5;
const FACTOR = 19 / 81; // 0.9^(1/DECAY) - 1

export class FSRS {
  private w: number[];
  private desiredRetention: number;

  constructor(
    params: number[] = DEFAULT_PARAMS,
    desiredRetention: number = DESIRED_RETENTION
  ) {
    this.w = params;
    this.desiredRetention = desiredRetention;
  }

  repeat(card: Card, now: Date, rating: Rating): SchedulingResult {
    const prevState = card.state;
    const elapsedDays =
      card.lastReview !== null
        ? Math.max(
            0,
            (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

    const newCard = { ...card };
    newCard.elapsedDays = elapsedDays;
    newCard.lastReview = now;
    newCard.reps += 1;

    if (card.state === State.New) {
      newCard.difficulty = this.initDifficulty(rating);
      newCard.stability = this.initStability(rating);

      if (rating === Rating.Again) {
        newCard.state = State.Learning;
        newCard.scheduledDays = 0;
        newCard.nextReview = addMinutes(now, 1);
      } else if (rating === Rating.Hard) {
        newCard.state = State.Learning;
        newCard.scheduledDays = 0;
        newCard.nextReview = addMinutes(now, 5);
      } else if (rating === Rating.Good) {
        newCard.state = State.Learning;
        newCard.scheduledDays = 0;
        newCard.nextReview = addMinutes(now, 10);
      } else {
        // Easy
        const interval = this.nextInterval(newCard.stability);
        newCard.state = State.Review;
        newCard.scheduledDays = interval;
        newCard.nextReview = addDays(now, interval);
      }
    } else if (
      card.state === State.Learning ||
      card.state === State.Relearning
    ) {
      if (rating === Rating.Again) {
        newCard.difficulty = this.nextDifficulty(card.difficulty, rating);
        newCard.stability = this.shortTermStability(card.stability, rating);
        newCard.state =
          card.state === State.Learning ? State.Learning : State.Relearning;
        newCard.scheduledDays = 0;
        newCard.nextReview = addMinutes(now, 5);
      } else if (rating === Rating.Hard) {
        newCard.difficulty = this.nextDifficulty(card.difficulty, rating);
        newCard.stability = this.shortTermStability(card.stability, rating);
        newCard.state =
          card.state === State.Learning ? State.Learning : State.Relearning;
        newCard.scheduledDays = 0;
        newCard.nextReview = addMinutes(now, 10);
      } else {
        // Good or Easy
        newCard.difficulty = this.nextDifficulty(card.difficulty, rating);
        newCard.stability = this.shortTermStability(card.stability, rating);
        const interval = this.nextInterval(newCard.stability);
        newCard.state = State.Review;
        newCard.scheduledDays = interval;
        newCard.nextReview = addDays(now, interval);
      }
    } else {
      // State.Review
      const retrievability = this.forgettingCurve(elapsedDays, card.stability);

      newCard.difficulty = this.nextDifficulty(card.difficulty, rating);

      if (rating === Rating.Again) {
        newCard.stability = this.nextForgetStability(
          card.difficulty,
          card.stability,
          retrievability
        );
        newCard.state = State.Relearning;
        newCard.lapses += 1;
        newCard.scheduledDays = 0;
        newCard.nextReview = addMinutes(now, 5);
      } else if (rating === Rating.Hard) {
        newCard.stability = this.nextRecallStability(
          card.difficulty,
          card.stability,
          retrievability,
          rating
        );
        const interval = this.nextInterval(newCard.stability);
        newCard.scheduledDays = interval;
        newCard.nextReview = addDays(now, interval);
      } else {
        // Good or Easy
        newCard.stability = this.nextRecallStability(
          card.difficulty,
          card.stability,
          retrievability,
          rating
        );
        const interval = this.nextInterval(newCard.stability);
        newCard.scheduledDays = interval;
        newCard.nextReview = addDays(now, interval);
      }
    }

    const log: ReviewLog = {
      rating,
      state: prevState,
      elapsedDays: Math.round(elapsedDays),
      scheduledDays: newCard.scheduledDays,
      review: now,
    };

    return { card: newCard, log };
  }

  /** Stabilité initiale selon la note */
  initStability(rating: Rating): number {
    return Math.max(this.w[rating - 1], 0.1);
  }

  /** Difficulté initiale selon la note */
  initDifficulty(rating: Rating): number {
    return clamp(this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1, 1, 10);
  }

  /** Courbe d'oubli — probabilité de rappel */
  forgettingCurve(elapsedDays: number, stability: number): number {
    if (stability === 0) return 0;
    return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
  }

  /** Prochain intervalle en jours */
  nextInterval(stability: number): number {
    const interval =
      (stability / FACTOR) *
      (Math.pow(this.desiredRetention, 1 / DECAY) - 1);
    return Math.max(1, Math.round(interval));
  }

  /** Prochaine difficulté après une review */
  nextDifficulty(d: number, rating: Rating): number {
    const nextD = d - this.w[6] * (rating - 3);
    return clamp(this.meanReversion(this.w[4], nextD), 1, 10);
  }

  /** Stabilité de rappel réussi (Good/Hard/Easy en Review) */
  nextRecallStability(
    d: number,
    s: number,
    r: number,
    rating: Rating
  ): number {
    const hardPenalty = rating === Rating.Hard ? this.w[15] : 1;
    const easyBonus = rating === Rating.Easy ? this.w[16] : 1;
    return (
      s *
      (1 +
        Math.exp(this.w[8]) *
          (11 - d) *
          Math.pow(s, -this.w[9]) *
          (Math.exp((1 - r) * this.w[10]) - 1) *
          hardPenalty *
          easyBonus)
    );
  }

  /** Stabilité après un oubli (Again en Review) */
  nextForgetStability(d: number, s: number, r: number): number {
    return (
      this.w[11] *
      Math.pow(d, -this.w[12]) *
      (Math.pow(s + 1, this.w[13]) - 1) *
      Math.exp((1 - r) * this.w[14])
    );
  }

  /** Stabilité court-terme (Learning/Relearning) */
  private shortTermStability(s: number, rating: Rating): number {
    // Utilise une mise à jour simplifiée pour Learning/Relearning
    const ratingFactor = rating === Rating.Again ? 0.5 : rating === Rating.Hard ? 0.8 : rating === Rating.Good ? 1.2 : 1.5;
    return Math.max(0.1, s * ratingFactor);
  }

  /** Régression vers la moyenne */
  private meanReversion(init: number, current: number): number {
    return this.w[7] * init + (1 - this.w[7]) * current;
  }
}

// ============================================================
// Utilitaires
// ============================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

// ============================================================
// Exports publics
// ============================================================

/** Instance FSRS singleton avec paramètres par défaut */
export const fsrs = new FSRS();

/** Créer une nouvelle carte SRS */
export function createNewCard(): Card {
  return {
    state: State.New,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    nextReview: new Date(),
  };
}

/** Texte lisible du prochain intervalle pour une carte et une note */
export function getNextReviewText(card: Card, rating: Rating): string {
  const result = fsrs.repeat(card, new Date(), rating);
  const nextCard = result.card;

  if (nextCard.scheduledDays === 0) {
    // Calculer la différence en minutes
    const diffMs = nextCard.nextReview.getTime() - new Date().getTime();
    const diffMin = Math.max(1, Math.round(diffMs / (60 * 1000)));
    if (diffMin < 60) return `${diffMin} min`;
    return `${Math.round(diffMin / 60)} h`;
  }

  const days = nextCard.scheduledDays;
  if (days === 1) return "1 jour";
  if (days < 30) return `${days} jours`;
  if (days < 365) return `${Math.round(days / 30)} mois`;
  return `${(days / 365).toFixed(1)} ans`;
}
