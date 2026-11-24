/*
  Warnings:

  - Added the required column `source_language` to the `StudySession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN     "source_language" TEXT NOT NULL;
