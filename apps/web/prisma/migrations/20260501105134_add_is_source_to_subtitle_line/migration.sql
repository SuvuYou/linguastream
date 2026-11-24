/*
  Warnings:

  - You are about to drop the column `translation_language` on the `SubtitleTrack` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[media_content_id,language]` on the table `SubtitleTrack` will be added. If there are existing duplicate values, this will fail.
  - Made the column `language` on table `SubtitleTrack` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_source` on table `SubtitleTrack` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "SubtitleTrack_media_content_id_translation_language_key";

-- AlterTable
ALTER TABLE "SubtitleTrack" DROP COLUMN "translation_language",
ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "is_source" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubtitleTrack_media_content_id_language_key" ON "SubtitleTrack"("media_content_id", "language");
