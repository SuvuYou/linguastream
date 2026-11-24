/*
  Warnings:

  - Added the required column `lemma` to the `WordProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `lexical_family` on the `WordProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `collocations` on the `WordProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WordProfile" ADD COLUMN     "lemma" TEXT NOT NULL,
DROP COLUMN "lexical_family",
ADD COLUMN     "lexical_family" JSONB NOT NULL,
DROP COLUMN "collocations",
ADD COLUMN     "collocations" JSONB NOT NULL;
