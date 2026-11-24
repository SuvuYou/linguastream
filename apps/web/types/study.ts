export interface StudyCard {
  id: string;
  word: string;
  source_language: string;
  translation_language: string;
  word_translation: string;
  context_text: string;
  context_translation: string;
  contextual_definition: string;
  media_content_id: string;
  start_ms: number;
  end_ms: number;
  next_review: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  word_profile: {
    part_of_speech: string;
  } | null;
}
