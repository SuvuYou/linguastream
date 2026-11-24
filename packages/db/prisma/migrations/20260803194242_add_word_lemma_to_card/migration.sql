/*
  Warnings:

  - Added the required column `lemma` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "lemma" TEXT NOT NULL;
