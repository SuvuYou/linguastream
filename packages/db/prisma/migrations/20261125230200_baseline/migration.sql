-- CreateEnum
CREATE TYPE "processing_status" AS ENUM ('pending', 'processing', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "word_status" AS ENUM ('unknown', 'learning', 'known', 'ignored');

-- CreateEnum
CREATE TYPE "status_source" AS ENUM ('manual', 'placement', 'save');

-- CreateEnum
CREATE TYPE "card_state" AS ENUM ('new', 'learning', 'review', 'relearning');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "native_language" TEXT NOT NULL,
    "learning_language" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "youtube_video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel_name" TEXT,
    "duration_ms" INTEGER,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" UUID NOT NULL,
    "video_id" UUID NOT NULL,
    "youtube_track_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "is_auto_captions" BOOLEAN NOT NULL,
    "raw_json3" BYTEA NOT NULL,
    "content_hash" TEXT NOT NULL,
    "processing_version" INTEGER NOT NULL,
    "status" "processing_status" NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lines" (
    "id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "index" INTEGER NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "raw_text" TEXT NOT NULL,
    "words" JSONB NOT NULL,
    "lemmas" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_translations" (
    "id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "status" "processing_status" NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error_code" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "line_translations" (
    "translation_id" UUID NOT NULL,
    "line_id" UUID NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "line_translations_pkey" PRIMARY KEY ("translation_id","line_id")
);

-- CreateTable
CREATE TABLE "video_lemma_counts" (
    "video_id" UUID NOT NULL,
    "lemma" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "video_lemma_counts_pkey" PRIMARY KEY ("video_id","lemma")
);

-- CreateTable
CREATE TABLE "vocabulary_words" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "status" "word_status" NOT NULL,
    "status_source" "status_source" NOT NULL,
    "saved_at" TIMESTAMPTZ(6),
    "own_translation" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vocabulary_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" UUID NOT NULL,
    "word_id" UUID NOT NULL,
    "video_id" UUID,
    "line_id" UUID,
    "youtube_video_id" TEXT NOT NULL,
    "video_title" TEXT NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "sentence" TEXT NOT NULL,
    "translation" TEXT,
    "pos" TEXT,
    "meaning" JSONB,
    "grammar" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_words" (
    "deck_id" UUID NOT NULL,
    "word_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_words_pkey" PRIMARY KEY ("deck_id","word_id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" UUID NOT NULL,
    "word_id" UUID NOT NULL,
    "due" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scheduled_days" INTEGER NOT NULL DEFAULT 0,
    "learning_steps" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" "card_state" NOT NULL DEFAULT 'new',
    "last_review" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_logs" (
    "id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "state_before" JSONB NOT NULL,
    "reviewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_ms" INTEGER,

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_entries" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "gender" TEXT,
    "plural" TEXT,
    "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "senses" JSONB NOT NULL,
    "sense_count" INTEGER NOT NULL,

    CONSTRAINT "dictionary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_forms" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "dictionary_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lemma_frequencies" (
    "language" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "count" BIGINT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "lemma_frequencies_pkey" PRIMARY KEY ("language","word")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "videos_user_id_youtube_video_id_key" ON "videos"("user_id", "youtube_video_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_video_id_youtube_track_id_content_hash_processing_ve_key" ON "tracks"("video_id", "youtube_track_id", "content_hash", "processing_version");

-- CreateIndex
CREATE UNIQUE INDEX "lines_track_id_index_key" ON "lines"("track_id", "index");

-- CreateIndex
CREATE UNIQUE INDEX "track_translations_track_id_language_key" ON "track_translations"("track_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_words_user_id_language_lemma_key" ON "vocabulary_words"("user_id", "language", "lemma");

-- CreateIndex
CREATE UNIQUE INDEX "decks_user_id_name_key" ON "decks"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cards_word_id_key" ON "cards"("word_id");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lines" ADD CONSTRAINT "lines_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_translations" ADD CONSTRAINT "track_translations_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_translations" ADD CONSTRAINT "line_translations_translation_id_fkey" FOREIGN KEY ("translation_id") REFERENCES "track_translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "line_translations" ADD CONSTRAINT "line_translations_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_lemma_counts" ADD CONSTRAINT "video_lemma_counts_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_words" ADD CONSTRAINT "vocabulary_words_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "vocabulary_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_words" ADD CONSTRAINT "deck_words_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_words" ADD CONSTRAINT "deck_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "vocabulary_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "vocabulary_words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
