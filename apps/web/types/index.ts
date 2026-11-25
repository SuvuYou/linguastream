// Shape of the legacy library response; the tables were removed (D-092).
export interface MergedContentItem {
  id: string;
  user_id: string;
  title: string;
  type: string;
  source_language: string;
  source_subtitle_acquisition_method: string | null;
  jellyfin_id: string | null;
  file_path: string | null;
  youtube_video_id: string | null;
  job_status: string | null;
  job_progress: number | null;
  job_logs: string | null;
  created_at: string;
  thumbnailUrl: string;
  subtitle_tracks: { language: string }[];
}

// Shape of the legacy word-profile response; the table was removed (D-092).
export interface WordProfile {
  id: string;
  word: string;
  lemma: string;
  source_language: string;
  part_of_speech: string;
  forms: unknown;
  lexical_family: unknown;
  collocations: unknown;
  generated_at: string;
}

export interface LexicalFamilyItem {
  word: string;
  translation: string;
}

export interface CollocationItem {
  phrase: string;
  translation: string;
}
