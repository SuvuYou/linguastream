/*
  Warnings:

  - You are about to drop the `WordCollocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WordRelation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `collocations` to the `WordProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lexical_family` to the `WordProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WordCollocation" DROP CONSTRAINT "WordCollocation_profileId_fkey";

-- DropForeignKey
ALTER TABLE "WordRelation" DROP CONSTRAINT "WordRelation_profileId_fkey";

-- AlterTable
ALTER TABLE "WordProfile" ADD COLUMN     "collocations" JSONB NOT NULL,
ADD COLUMN     "lexical_family" JSONB NOT NULL;

-- DropTable
DROP TABLE "WordCollocation";

-- DropTable
DROP TABLE "WordRelation";
