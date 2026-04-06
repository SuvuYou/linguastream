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
