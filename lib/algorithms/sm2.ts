export type SMRating = 0 | 1 | 2 | 3; // Again / Hard / Good / Easy
// maps to SM-2 quality scores: 0 → 1, 1 → 3, 2 → 4, 3 → 5

const QUALITY_MAP: Record<SMRating, number> = {
  0: 1, // Again
  1: 3, // Hard
  2: 4, // Good
  3: 5, // Easy
};

const MIN_EASE = 1.3;

interface SMInput {
  repetitions: number;
  interval_days: number;
  ease_factor: number;
}

interface SMOutput {
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  next_review: Date;
}

export function calculateNextReview(card: SMInput, rating: SMRating): SMOutput {
  let { repetitions, interval_days, ease_factor } = card;

  if (rating == 0) {
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) {
      interval_days = 1;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    repetitions += 1;
  }

  const quality = QUALITY_MAP[rating];

  ease_factor =
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease_factor = Math.max(MIN_EASE, ease_factor);

  const next_review = new Date();
  next_review.setDate(next_review.getDate() + interval_days);

  return { repetitions, interval_days, ease_factor, next_review };
}
