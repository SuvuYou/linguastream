export type FSRSRating = 1 | 2 | 3 | 4; // Again / Hard / Good / Easy

export interface FSRSInput {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  repetitions: number;
  state: "New" | "Learning" | "Review" | "Relearning";
}

export interface FSRSOutput {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  repetitions: number;
  state: "New" | "Learning" | "Review" | "Relearning";
  interval_days: number;
}

// Default FSRS v4.5 parameters
const w: number[] = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
  0.34, 1.26, 0.29, 2.61,
];

const REQUEST_RETENTION = 0.9; // Target retention rate (90%)
const MAXIMUM_INTERVAL = 36500;

export function calculateNextReview(
  card: FSRSInput,
  rating: FSRSRating,
  now: Date = new Date(),
): FSRSOutput {
  const lastReview = new Date(card.due);

  const elapsed_days =
    card.state === "New"
      ? 0
      : Math.max(
          0,
          Math.floor(
            (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

  let { stability, difficulty, repetitions, state } = card;

  if (state === "New") {
    stability = w[rating - 1];
    difficulty = w[4] - (rating - 3) * w[5];
    difficulty = Math.min(Math.max(difficulty, 1), 10);
    repetitions = 1;
    state = rating === 1 ? "Learning" : "Review";
  } else {
    const retrievability = Math.pow(1 + elapsed_days / (9 * stability), -1);

    if (rating === 1) {
      state = "Relearning";
      stability =
        w[11] *
        Math.pow(difficulty, -w[12]) *
        (Math.pow(stability + 1, w[13]) - 1) *
        Math.exp(w[14] * (1 - retrievability));
      difficulty = difficulty + w[6] * (3 - (rating - 1));
    } else {
      const hardPenalty = rating === 2 ? w[15] : 1;
      const easyBonus = rating === 4 ? w[16] : 1;

      stability =
        stability *
        (1 +
          Math.exp(w[8]) *
            (11 - difficulty) *
            Math.pow(stability, -w[9]) *
            (Math.exp((1 - retrievability) * w[10]) - 1) *
            hardPenalty *
            easyBonus);
      difficulty = difficulty + w[6] * (3 - (rating - 1));
      state = "Review";
    }
    difficulty = Math.min(Math.max(difficulty, 1), 10);
    repetitions += 1;
  }

  // Calculate next interval using the desired retention formula: I = (S / 9) * (1 / R - 1)
  let interval_days = Math.round((stability / 9) * (1 / REQUEST_RETENTION - 1));
  interval_days = Math.max(1, Math.min(interval_days, MAXIMUM_INTERVAL));

  const next_review = new Date(now);
  next_review.setHours(0, 0, 0, 0);
  next_review.setDate(next_review.getDate() + interval_days);

  return {
    due: next_review,
    stability: Number(stability.toFixed(4)),
    difficulty: Number(difficulty.toFixed(4)),
    elapsed_days,
    repetitions,
    state,
    interval_days,
  };
}
