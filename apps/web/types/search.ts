/** One search hit: a source subtitle line with its matching translation. */
export interface SubtitleSearchDocument {
  id: string;

  // source
  source_subtitle_line_id: string;
  source_text: string;
  source_language: string;

  // translation
  translation_language: string;
  translation_text: string;

  // playback
  start_ms: number;
  end_ms: number;

  // media
  media_content_id: string;
  media_title: string;
  youtube_video_id: string;

  // access
  is_global: boolean;
  owner_user_id: string | null;
}

export interface SearchResponse {
  results: SubtitleSearchDocument[];
  page: number;
  totalPages: number;
  totalHits: number;
  hitsPerPage: number;
}
