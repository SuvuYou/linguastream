import {
  LIBRARY_PAGE_SIZE,
  type LibraryPage,
  type LibraryVideo,
} from "@linguastream/contracts";
import { mockVideos } from "./watch";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-11-27T12:00:00.000Z");

const CHANNELS = ["Nordlicht Reisen", "Deutsch mit Lena", "Küchenzeit", null];
const TOPICS = [
  "Wochenmarkt in Leipzig",
  "Mit dem Rad an der Ostsee",
  "Wie man Brezeln backt",
  "Ein Abend im Biergarten",
  "Der Rhein von oben",
  "Zehn Wörter, die jeder braucht",
];

function fromWatch(index: number): LibraryVideo {
  const { video } = Object.values(mockVideos)[index]!;
  const track = video.track;
  return {
    id: video.id,
    youtube_video_id: video.youtube_video_id,
    title: video.title,
    channel_name: video.channel_name,
    duration_ms: video.duration_ms,
    added_at: new Date(NOW - index * 3 * 60 * 60 * 1000).toISOString(),
    track: track && {
      id: `0190f3c2-7d1a-7c00-8c00-00000000000${index}`,
      status: track.status,
      progress: track.status === "processing" ? 3 : track.status === "ready" ? 5 : 1,
      error_code: track.status === "failed" ? "internal" : null,
    },
    translation: video.translation,
  };
}

function generated(n: number): LibraryVideo {
  const id = String(n).padStart(12, "0");
  return {
    id: `0190f3c2-7d1a-7c00-8d00-${id}`,
    youtube_video_id: `mock${String(n).padStart(7, "0")}`,
    title: `${TOPICS[n % TOPICS.length]} (Folge ${n})`,
    channel_name: CHANNELS[n % CHANNELS.length]!,
    duration_ms: (4 + (n % 9) * 3) * 60_000 + n * 1_000,
    added_at: new Date(NOW - (n + 1) * 1.5 * DAY_MS).toISOString(),
    track: {
      id: `0190f3c2-7d1a-7c00-8e00-${id}`,
      status: "ready",
      progress: 5,
      error_code: null,
    },
    translation: { language: "uk", status: n % 5 === 0 ? "none" : "ready" },
  };
}

export const mockLibrary: LibraryVideo[] = [
  ...Object.keys(mockVideos).map((_, i) => fromWatch(i)),
  ...Array.from({ length: 25 }, (_, i) => generated(i + 1)),
];

export function translateMockVideo(videoId: string) {
  const video = mockLibrary.find((v) => v.id === videoId);
  if (!video?.translation || video.translation.status === "ready") return undefined;
  video.translation = { ...video.translation, status: "pending" };
  const detail = mockVideos[videoId]?.video;
  if (detail) detail.translation = video.translation;
  return { video_id: videoId, translation: { language: video.translation.language, status: "pending" as const } };
}

export function deleteMockVideo(videoId: string) {
  const index = mockLibrary.findIndex((v) => v.id === videoId);
  if (index === -1) return undefined;
  mockLibrary.splice(index, 1);
  return { video_id: videoId, deleted: true as const };
}

export function libraryPage(page: number, search?: string): LibraryPage {
  const needle = search?.toLowerCase();
  const matching = needle
    ? mockLibrary.filter(
        (v) =>
          v.title.toLowerCase().includes(needle) ||
          v.channel_name?.toLowerCase().includes(needle),
      )
    : mockLibrary;
  const start = page * LIBRARY_PAGE_SIZE;
  return {
    items: matching.slice(start, start + LIBRARY_PAGE_SIZE),
    page,
    page_size: LIBRARY_PAGE_SIZE,
    total: matching.length,
  };
}
