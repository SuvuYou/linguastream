-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySessionCard" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudySessionCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_user_id_idx" ON "StudySession"("user_id");

-- CreateIndex
CREATE INDEX "StudySession_deck_id_idx" ON "StudySession"("deck_id");

-- CreateIndex
CREATE INDEX "StudySession_created_at_idx" ON "StudySession"("created_at");

-- CreateIndex
CREATE INDEX "StudySession_expires_at_idx" ON "StudySession"("expires_at");

-- CreateIndex
CREATE INDEX "StudySessionCard_session_id_position_idx" ON "StudySessionCard"("session_id", "position");

-- CreateIndex
CREATE INDEX "StudySessionCard_card_id_idx" ON "StudySessionCard"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudySessionCard_session_id_position_key" ON "StudySessionCard"("session_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "StudySessionCard_session_id_card_id_key" ON "StudySessionCard"("session_id", "card_id");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySessionCard" ADD CONSTRAINT "StudySessionCard_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySessionCard" ADD CONSTRAINT "StudySessionCard_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
