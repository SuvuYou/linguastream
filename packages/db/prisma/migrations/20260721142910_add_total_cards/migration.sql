/*
  Warnings:

  - Added the required column `total_cards` to the `StudySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN     "total_cards" INTEGER NOT NULL;
