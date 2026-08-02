"use client";

import Image from "next/image";
import Link from "next/link";
import {
  JOB_STATUS,
  YOUTUBE_CONTENT_TYPE,
  UPLOAD_CONTENT_TYPE,
} from "@/helpers/const";
import { useJobPolling } from "@/hooks/useJobPolling";

export interface PersonalItem {
  id: string;
  title: string;
  type: string;
  source_language: string;
  youtube_video_id: string | null;
  file_path: string | null;
  job_status: string | null;
  job_progress: number | null;
  thumbnailUrl: string | null;
  subtitle_tracks: { subtitle_language: string }[];
}

export default function PersonalCard({ item }: { item: PersonalItem }) {
  const { jobState, elementRef } = useJobPolling(
    item.id,
    item.job_status,
    item.job_progress,
  );

  const isProcessing =
    jobState.status === JOB_STATUS.PENDING ||
    jobState.status === JOB_STATUS.RUNNING;
  const isError = jobState.status === JOB_STATUS.ERROR;
  const isClickable =
    !isProcessing && !isError && jobState.status !== JOB_STATUS.PENDING;

  return (
    <div
      ref={elementRef}
      className="relative border border-primary-border p-4 hover:bg-background-hover transition-colors group"
    >
      <div className="aspect-video bg-background mb-3 overflow-hidden relative">
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
            <svg
              className="animate-spin w-5 h-5 text-active-border"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4a8 8 0 01-8-8z"
              />
            </svg>
            <div className="w-full">
              <div className="w-full h-0.5 bg-primary-border">
                <div
                  className="h-full bg-active-border transition-all duration-500"
                  style={{ width: `${jobState.progress}%` }}
                />
              </div>
              <div className="text-xs text-secondary-text mt-1.5 text-center tabular-nums">
                {jobState.progress}%
              </div>
            </div>
          </div>
        ) : item.thumbnailUrl ? (
          isClickable ? (
            <Link href={`/watch/${item.id}`}>
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                width={320}
                height={180}
                unoptimized
              />
            </Link>
          ) : (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover opacity-40"
              width={320}
              height={180}
              unoptimized
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-secondary-text text-xs">
            {item.type === UPLOAD_CONTENT_TYPE
              ? "Uploaded file"
              : "No thumbnail"}
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="text-xs px-1.5 py-0.5 bg-background/80 border border-primary-border text-secondary-text">
            {item.type === YOUTUBE_CONTENT_TYPE ? "YT" : "Upload"}
          </span>
        </div>
      </div>

      {isClickable ? (
        <Link href={`/watch/${item.id}`}>
          <div className="text-sm font-medium truncate text-primary-text">
            {item.title}
          </div>
        </Link>
      ) : (
        <div className="text-sm font-medium truncate text-secondary-text">
          {item.title}
        </div>
      )}
    </div>
  );
}
