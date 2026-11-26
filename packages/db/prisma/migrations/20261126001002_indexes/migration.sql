-- CreateIndex
CREATE INDEX "connections_word_id_idx" ON "connections"("word_id");

-- CreateIndex
CREATE INDEX "connections_video_id_idx" ON "connections"("video_id");

-- CreateIndex
CREATE INDEX "connections_line_id_idx" ON "connections"("line_id");

-- CreateIndex
CREATE INDEX "deck_words_word_id_idx" ON "deck_words"("word_id");

-- CreateIndex
CREATE INDEX "line_translations_line_id_idx" ON "line_translations"("line_id");

-- CreateIndex
CREATE INDEX "lines_lemmas_idx" ON "lines" USING GIN ("lemmas");

-- CreateIndex
CREATE INDEX "review_logs_card_id_idx" ON "review_logs"("card_id");

-- CreateIndex
CREATE INDEX "vocabulary_words_user_id_saved_at_idx" ON "vocabulary_words"("user_id", "saved_at" DESC);
