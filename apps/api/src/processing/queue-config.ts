import type { ConnectionOptions, JobsOptions } from "bullmq";

export const PROCESSING_QUEUE = "processing";
export const PROCESS_TRACK_JOB = "process-track";

export interface ProcessTrackJob {
  trackId: string;
}

export const PROCESS_TRACK_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 10_000 },
  removeOnComplete: true,
  removeOnFail: { age: 7 * 24 * 60 * 60 },
} satisfies JobsOptions;

function redisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}

export function producerConnection(): ConnectionOptions {
  return { url: redisUrl(), enableOfflineQueue: false };
}

export function blockingConnection(): ConnectionOptions {
  return { url: redisUrl(), maxRetriesPerRequest: null };
}
