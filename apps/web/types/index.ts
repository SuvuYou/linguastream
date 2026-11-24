import type { MediaContent, SubtitleTrack } from "@prisma/client";

export interface MergedContentItem extends MediaContent {
  thumbnailUrl: string;
  subtitle_tracks: Pick<SubtitleTrack, "language">[];
}

export interface LexicalFamilyItem {
  word: string;
  translation: string;
}

export interface CollocationItem {
  phrase: string;
  translation: string;
}
