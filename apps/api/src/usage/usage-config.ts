function fromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const CHARACTERS_PER_MINUTE = 55_000 / 60;

export function usageLimits() {
  return {
    transferCharactersPerDay: fromEnv("TRANSFER_CHARS_PER_DAY", 165_000),
    aiCallsPerDay: fromEnv("AI_CALLS_PER_DAY", 200),
    monthlySpendCapMicroUsd: fromEnv("MONTHLY_SPEND_CAP_USD", 10) * 1_000_000,
  };
}

export const MODEL_PRICES_MICRO_USD_PER_TOKEN: Record<string, { input: number; output: number }> = {
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 },
  "gemini-3.5-flash": { input: 0.5, output: 3 },
};

export function costMicroUsd(model: string, inputTokens: number, outputTokens: number): number {
  const price = MODEL_PRICES_MICRO_USD_PER_TOKEN[model] ?? MODEL_PRICES_MICRO_USD_PER_TOKEN["gemini-3.5-flash"]!;
  return Math.ceil(inputTokens * price.input + outputTokens * price.output);
}

const berlinDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function berlinDay(now: Date): string {
  return berlinDate.format(now);
}

export function utcMonth(now: Date): string {
  return now.toISOString().slice(0, 7);
}

export const DAY_KEY_TTL_SECONDS = 2 * 24 * 60 * 60;
export const MONTH_KEY_TTL_SECONDS = 40 * 24 * 60 * 60;

export const usageKeys = {
  transfer: (userId: string, day: string) => `usage:transfer:${userId}:${day}`,
  aiCalls: (userId: string, day: string) => `usage:ai:${userId}:${day}`,
  spend: (month: string) => `usage:spend:${month}`,
  capLogged: (month: string) => `usage:cap-logged:${month}`,
};
