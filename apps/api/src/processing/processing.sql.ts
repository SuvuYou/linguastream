import { Prisma } from "@linguastream/db";

export function updateLineTextsAndWords(trackId: string, indexes: number[], texts: string[], words: string[]) {
  return Prisma.sql`
    UPDATE lines SET text = v.text, words = v.words::jsonb
    FROM unnest(${indexes}::int[], ${texts}::text[], ${words}::text[]) AS v(idx, text, words)
    WHERE lines.track_id = ${trackId}::uuid AND lines.index = v.idx`;
}

export function updateLineWordsAndLemmas(trackId: string, indexes: number[], words: string[], lemmas: string[]) {
  return Prisma.sql`
    UPDATE lines SET words = v.words::jsonb,
      lemmas = ARRAY(SELECT jsonb_array_elements_text(v.lemmas::jsonb))
    FROM unnest(${indexes}::int[], ${words}::text[], ${lemmas}::text[]) AS v(idx, words, lemmas)
    WHERE lines.track_id = ${trackId}::uuid AND lines.index = v.idx`;
}

export function upsertLineTranslations(translationId: string, lineIds: string[], texts: string[]) {
  return Prisma.sql`
    INSERT INTO line_translations (translation_id, line_id, text)
    SELECT ${translationId}::uuid, v.line_id, v.text
    FROM unnest(${lineIds}::uuid[], ${texts}::text[]) AS v(line_id, text)
    ON CONFLICT (translation_id, line_id) DO UPDATE SET text = EXCLUDED.text`;
}

export function insertLemmaCounts(videoId: string, lemmas: string[], counts: number[]) {
  return Prisma.sql`
    INSERT INTO video_lemma_counts (video_id, lemma, count)
    SELECT ${videoId}::uuid, v.lemma, v.count
    FROM unnest(${lemmas}::text[], ${counts}::int[]) AS v(lemma, count)`;
}
