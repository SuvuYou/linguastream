/*
  Warnings:

  - You are about to drop the column `subtitle_line_id` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp_ms` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Deck` table. All the data in the column will be lost.
  - Added the required column `end_ms` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_subtitle_line_id` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_ms` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `translation_text` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_media_content_id_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_subtitle_line_id_fkey";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "subtitle_line_id",
DROP COLUMN "timestamp_ms",
ADD COLUMN     "end_ms" INTEGER NOT NULL,
ADD COLUMN     "repetitions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "source_subtitle_line_id" TEXT NOT NULL,
ADD COLUMN     "start_ms" INTEGER NOT NULL,
ADD COLUMN     "translation_text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "language",
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;
