-- CreateTable
CREATE TABLE "blocked_videos" (
    "youtube_video_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_videos_pkey" PRIMARY KEY ("youtube_video_id")
);
