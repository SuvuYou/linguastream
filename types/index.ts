import type { MediaContent, SubtitleTrack } from "@prisma/client";

export interface MergedContentItem extends MediaContent {
  jellyfinItem?: JellyfinItem;
  thumbnailUrl: string;
  subtitle_tracks: Pick<SubtitleTrack, "translation_language">[];
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
