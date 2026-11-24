-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'running', 'done', 'error');

-- CreateEnum
CREATE TYPE "AcquisitionMethod" AS ENUM ('upload', 'whisperx');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "native_language" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaContent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "source_subtitle_acquisition_method" "AcquisitionMethod",
    "jellyfin_id" TEXT,
    "file_path" TEXT,
    "youtube_video_id" TEXT,
    "job_status" "JobStatus",
    "job_progress" INTEGER,
    "job_logs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtitleTrack" (
    "id" TEXT NOT NULL,
    "media_content_id" TEXT NOT NULL,
    "translation_language" TEXT NOT NULL,
    "language" TEXT,
    "is_source" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubtitleTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtitleLine" (
    "id" TEXT NOT NULL,
    "media_content_id" TEXT NOT NULL,
    "subtitle_track_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "SubtitleLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordProfile" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "part_of_speech" TEXT NOT NULL,
    "forms" JSONB NOT NULL,
    "lexical_family" TEXT[],
    "collocations" TEXT[],
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "subtitle_line_id" TEXT NOT NULL,
    "media_content_id" TEXT NOT NULL,
    "word_profile_id" TEXT,
    "word" TEXT NOT NULL,
    "source_language" TEXT NOT NULL,
    "translation_language" TEXT NOT NULL,
    "timestamp_ms" INTEGER NOT NULL,
    "next_review" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interval_days" INTEGER NOT NULL DEFAULT 1,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SubtitleTrack_media_content_id_translation_language_key" ON "SubtitleTrack"("media_content_id", "translation_language");

-- CreateIndex
CREATE UNIQUE INDEX "WordProfile_word_source_language_key" ON "WordProfile"("word", "source_language");

-- AddForeignKey
ALTER TABLE "MediaContent" ADD CONSTRAINT "MediaContent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtitleTrack" ADD CONSTRAINT "SubtitleTrack_media_content_id_fkey" FOREIGN KEY ("media_content_id") REFERENCES "MediaContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtitleLine" ADD CONSTRAINT "SubtitleLine_media_content_id_fkey" FOREIGN KEY ("media_content_id") REFERENCES "MediaContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtitleLine" ADD CONSTRAINT "SubtitleLine_subtitle_track_id_fkey" FOREIGN KEY ("subtitle_track_id") REFERENCES "SubtitleTrack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_subtitle_line_id_fkey" FOREIGN KEY ("subtitle_line_id") REFERENCES "SubtitleLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_media_content_id_fkey" FOREIGN KEY ("media_content_id") REFERENCES "MediaContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_word_profile_id_fkey" FOREIGN KEY ("word_profile_id") REFERENCES "WordProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
