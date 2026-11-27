-- AlterTable
ALTER TABLE "dictionary_entries" ADD COLUMN     "word_lower" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dictionary_forms" ADD COLUMN     "form_lower" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "gloss_translations" (
    "language" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "pos" TEXT NOT NULL,
    "gloss" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gloss_translations_pkey" PRIMARY KEY ("language","word","pos","gloss","target_language")
);

-- CreateTable
CREATE TABLE "ai_word_entries" (
    "language" TEXT NOT NULL,
    "lemma" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "pos" TEXT,
    "gender" TEXT,
    "gloss" TEXT,
    "parts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_word_entries_pkey" PRIMARY KEY ("language","lemma","target_language")
);

-- CreateIndex
CREATE INDEX "dictionary_entries_language_word_idx" ON "dictionary_entries"("language", "word");

-- CreateIndex
CREATE INDEX "dictionary_entries_language_word_lower_idx" ON "dictionary_entries"("language", "word_lower");

-- CreateIndex
CREATE INDEX "dictionary_forms_language_form_lower_idx" ON "dictionary_forms"("language", "form_lower");
