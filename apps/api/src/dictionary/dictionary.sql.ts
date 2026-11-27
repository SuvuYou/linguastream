import { Prisma } from "@linguastream/db";

export function firstLineWithLemma(trackId: string, lemmas: string[]) {
  return Prisma.sql`
    SELECT DISTINCT ON (lemma) lemma, text
    FROM lines, unnest(lemmas) AS lemma
    WHERE track_id = ${trackId}::uuid AND lemma = ANY(${lemmas}::text[])
    ORDER BY lemma, index`;
}
