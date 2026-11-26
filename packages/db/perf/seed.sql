-- Generated data for measuring indexes (card [7], docs/changes/007-indexes).
-- About a year of heavy use on the friends instance: 20 users, 1,000 videos,
-- 800,000 lines. Runs against the perf database only; truncates everything first.

-- UUID v7 like Prisma's: a random UUID with the first 48 bits replaced by the
-- Unix time in milliseconds and the version set to 7. Postgres 17 has no uuidv7().
CREATE OR REPLACE FUNCTION perf_uuid7() RETURNS uuid AS $$
  SELECT encode(
    set_bit(set_bit(
      overlay(uuid_send(gen_random_uuid())
              PLACING substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3)
              FROM 1 FOR 6),
      52, 1), 53, 1),
    'hex')::uuid;
$$ LANGUAGE sql VOLATILE;

-- A lemma drawn from 20,000 with a Zipf-like curve: rank k has probability
-- about 1/k, so "w1" is as common as "der" (~7 % of words) and "w5000" is rare.
CREATE OR REPLACE FUNCTION perf_lemma() RETURNS text AS $$
  SELECT 'w' || floor(exp(random() * ln(20001)))::int;
$$ LANGUAGE sql VOLATILE;

TRUNCATE users, videos, tracks, lines, track_translations, line_translations,
  video_lemma_counts, vocabulary_words, connections, decks, deck_words, cards, review_logs;

-- 20 users
INSERT INTO users (id, firebase_uid, email, native_language, learning_language)
SELECT perf_uuid7(), 'perf-' || u, 'perf-' || u || '@example.com', 'en', 'de'
FROM generate_series(1, 20) u;

-- 50 videos per user, one track each
INSERT INTO videos (id, user_id, youtube_video_id, title, language)
SELECT perf_uuid7(), users.id, 'yt-' || users.firebase_uid || '-' || v, 'Video ' || v, 'de'
FROM users, generate_series(1, 50) v
ORDER BY users.firebase_uid, v;

INSERT INTO tracks (id, video_id, youtube_track_id, language, is_auto_captions, raw_json3,
                    content_hash, processing_version, status, progress)
SELECT perf_uuid7(), id, 'asr.de', 'de', true, '\x00', md5(id::text), 1, 'ready', 100
FROM videos ORDER BY id;

-- 800 lines per track, 4 s each, 6–10 words per line. The words JSON has the
-- size of the real per-word data (D-052), so table scans cost what they would.
INSERT INTO lines (id, track_id, index, start_ms, end_ms, text, raw_text, words, lemmas)
SELECT perf_uuid7(), t.id, i, i * 4000, i * 4000 + 3800,
       array_to_string(l.lemmas, ' '), array_to_string(l.lemmas, ' '),
       (SELECT jsonb_agg(jsonb_build_object(
                 'surface', x, 'lemma', x, 'pos', 'NOUN',
                 'morph', 'Case=Nom|Gender=Masc|Number=Sing',
                 'dep', 'nsubj', 'head', 2, 'start', 0, 'end', length(x), 'startMs', i * 4000))
          FROM unnest(l.lemmas) x),
       l.lemmas
FROM tracks t
CROSS JOIN generate_series(0, 799) i
CROSS JOIN LATERAL (
  SELECT array(SELECT perf_lemma() FROM generate_series(1, 6 + ((i + hashtext(t.id::text)) % 5 + 5) % 5)) AS lemmas
) l
ORDER BY t.id, i;

-- 5,000 vocabulary rows per user (placement marks many lemmas); 2,000 of them saved.
INSERT INTO vocabulary_words (id, user_id, language, lemma, status, status_source, saved_at, updated_at)
SELECT perf_uuid7(), users.id, 'de', 'w' || k,
       CASE WHEN k <= 2000 THEN 'learning'::word_status ELSE 'known'::word_status END,
       CASE WHEN k <= 2000 THEN 'save'::status_source ELSE 'placement'::status_source END,
       CASE WHEN k <= 2000 THEN now() - (random() * interval '365 days') END,
       now()
FROM users, generate_series(1, 5000) k;

-- One card per saved word, due from 30 days ago to 6 months ahead.
INSERT INTO cards (id, word_id, due, stability, difficulty, reps, state, last_review)
SELECT perf_uuid7(), id, now() + (random() * 210 - 30) * interval '1 day',
       random() * 100, random() * 10, (random() * 20)::int, 'review', now() - interval '3 days'
FROM vocabulary_words WHERE saved_at IS NOT NULL;

-- 5 reviews per card
INSERT INTO review_logs (id, card_id, rating, state_before, reviewed_at)
SELECT perf_uuid7(), cards.id, 1 + (random() * 3)::int, '{"state":"review"}', now() - r * interval '7 days'
FROM cards, generate_series(1, 5) r;

-- 3,000 connections per user, each to a random line of one of the user's videos.
INSERT INTO connections (id, word_id, video_id, line_id, youtube_video_id, video_title,
                         start_ms, end_ms, sentence, translation)
SELECT perf_uuid7(), w.id, picked.video_id, picked.line_id, picked.youtube_video_id, picked.title,
       picked.start_ms, picked.end_ms, picked.text, 'translation'
FROM users u
CROSS JOIN LATERAL (
  SELECT v.id AS video_id, l.id AS line_id, v.youtube_video_id, v.title, l.start_ms, l.end_ms, l.text,
         row_number() OVER () AS n
  FROM videos v
  JOIN tracks t ON t.video_id = v.id
  JOIN lines l ON l.track_id = t.id
  WHERE v.user_id = u.id AND l.index % 13 = 0
  ORDER BY random()
  LIMIT 3000
) picked
JOIN LATERAL (
  SELECT id FROM vocabulary_words
  WHERE user_id = u.id AND saved_at IS NOT NULL AND lemma = 'w' || (1 + picked.n % 2000)
) w ON true;

-- 3 decks per user with 300 words each
INSERT INTO decks (id, user_id, name)
SELECT perf_uuid7(), id, 'Deck ' || d FROM users, generate_series(1, 3) d;

INSERT INTO deck_words (deck_id, word_id)
SELECT d.id, w.id
FROM decks d
JOIN vocabulary_words w ON w.user_id = d.user_id AND w.saved_at IS NOT NULL
WHERE (substring(w.lemma FROM 2)::int % 3) + 1 = substring(d.name FROM 6)::int
  AND substring(w.lemma FROM 2)::int <= 900;

