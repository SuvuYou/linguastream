/*
  Warnings:

  - You are about to drop the column `source_subtitle_line_id` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `translation_text` on the `Card` table. All the data in the column will be lost.
  - Added the required column `context_text` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `word_translation` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "source_subtitle_line_id",
DROP COLUMN "translation_text",
ADD COLUMN     "context_text" TEXT NOT NULL,
ADD COLUMN     "context_translation" TEXT,
ADD COLUMN     "contextual_definition" TEXT,
ADD COLUMN     "word_translation" TEXT NOT NULL;
