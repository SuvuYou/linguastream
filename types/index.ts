import type { MediaContent } from "@prisma/client";

export interface MergedContentItem extends MediaContent {
  jellyfinItem?: JellyfinItem;
  thumbnailUrl: string;
}

export interface JellyfinItem {
  Id: string;
  Name: string;
  Type: string;
  RunTimeTicks?: number;
  ProductionYear?: number;
  ImageTags?: { Primary?: string };
  MediaSources?: JellyfinMediaSource[];
}

export interface JellyfinMediaSource {
  Id: string;
  Name: string;
  Path: string;
  Container: string;
  Size: number;
}

export const JOB_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
