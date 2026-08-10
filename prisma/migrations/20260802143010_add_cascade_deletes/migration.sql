-- DropForeignKey
ALTER TABLE "SubtitleLine" DROP CONSTRAINT "SubtitleLine_media_content_id_fkey";

-- DropForeignKey
ALTER TABLE "SubtitleLine" DROP CONSTRAINT "SubtitleLine_subtitle_track_id_fkey";

-- DropForeignKey
ALTER TABLE "SubtitleTrack" DROP CONSTRAINT "SubtitleTrack_media_content_id_fkey";

-- AddForeignKey
ALTER TABLE "SubtitleTrack" ADD CONSTRAINT "SubtitleTrack_media_content_id_fkey" FOREIGN KEY ("media_content_id") REFERENCES "MediaContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtitleLine" ADD CONSTRAINT "SubtitleLine_media_content_id_fkey" FOREIGN KEY ("media_content_id") REFERENCES "MediaContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtitleLine" ADD CONSTRAINT "SubtitleLine_subtitle_track_id_fkey" FOREIGN KEY ("subtitle_track_id") REFERENCES "SubtitleTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
