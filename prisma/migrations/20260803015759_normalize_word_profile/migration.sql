/*
  Warnings:

  - You are about to drop the column `collocations` on the `WordProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lexical_family` on the `WordProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WordProfile" DROP COLUMN "collocations",
DROP COLUMN "lexical_family";

-- CreateTable
CREATE TABLE "WordRelation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,

    CONSTRAINT "WordRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordCollocation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "translation" TEXT NOT NULL,

    CONSTRAINT "WordCollocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordRelation" ADD CONSTRAINT "WordRelation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WordProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCollocation" ADD CONSTRAINT "WordCollocation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "WordProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
