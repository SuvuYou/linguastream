"use client";

import Image from "next/image";
import Link from "next/link";
import { useJobPolling } from "@/hooks/useJobPolling";
import { JOB_STATUS } from "@/helpers/const";
import type { MergedContentItem } from "@/types";
import { useUser } from "@/hooks/useUser";

interface LibraryCardProps {
  item: MergedContentItem;
  onOpenConfigModal?: (item: MergedContentItem) => void;
}

export default function LibraryCard({
  item,
  onOpenConfigModal,
}: LibraryCardProps) {
  const user = useUser();

  const isAdmin = user.data?.is_admin;

  const hasActiveJob =
    item.job_status !== null && item.job_status !== JOB_STATUS.DONE;

  const { jobState, elementRef, resetJob } = useJobPolling(
    item.id,
    item.job_status,
    item.job_progress,
  );

  const isProcessing =
    jobState.status === JOB_STATUS.PENDING ||
    jobState.status === JOB_STATUS.RUNNING;

  const isError = jobState.status === JOB_STATUS.ERROR;

  if (!item.jellyfinItem) {
    return (
      <div className="relative border-r border-b border-primary-border p-4">
        <div className="aspect-video bg-background mb-3 flex items-center justify-center text-secondary-text text-xs">
          No longer available
        </div>
        <div className="text-sm font-medium truncate">{item.title}</div>
      </div>
    );
  }

  if (hasActiveJob || isProcessing || isError) {
    return (
      <div
        ref={elementRef}
        className="relative border-r border-b border-primary-border p-4"
      >
        <div className="aspect-video bg-background mb-3 flex flex-col items-center justify-center gap-3 px-4">
          {isError ? (
            <>
              <span className="text-xs text-red-400">
                Subtitle ingestion failed
              </span>
              {isAdmin && onOpenConfigModal && (
                <button
                  onClick={() => onOpenConfigModal(item)}
                  className="text-xs px-3 py-1 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
                >
                  Reconfigure
                </button>
              )}
            </>
          ) : (
            <>
              {isAdmin && (
                <button
                  onClick={() => resetJob()}
                  className="text-xs px-3 py-1 border border-primary-border text-secondary-text hover:text-primary-text transition-colors"
                >
                  Reset job
                </button>
              )}
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
            </>
          )}
        </div>
        <div className="text-sm font-medium truncate">
          {item.jellyfinItem.Name}
        </div>
        <div className="text-xs text-secondary-text mt-1">
          {item.jellyfinItem.Type}
        </div>
      </div>
    );
  }

  return (
    <div className="relative border-r border-b border-primary-border p-4 hover:bg-background-hover transition-colors group">
      <Link href={`/watch/${item.jellyfinItem.Id}`}>
        <div className="aspect-video bg-background mb-3 overflow-hidden">
          <Image
            src={item.thumbnailUrl}
            alt={item.jellyfinItem.Name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            width={1}
            height={1}
            loading="eager"
            unoptimized
          />
        </div>
        <div className="text-sm font-medium truncate">
          {item.jellyfinItem.Name}
        </div>
        <div className="text-xs text-secondary-text mt-1">
          {item.jellyfinItem.Type}
        </div>
      </Link>

      {isAdmin && onOpenConfigModal && (
        <button
          onClick={() => onOpenConfigModal(item)}
          className="absolute top-2 right-2 text-xs px-2 py-1 border border-primary-border text-secondary-text hover:text-primary-text bg-background opacity-0 group-hover:opacity-100 transition-all"
        >
          Configure
        </button>
      )}
    </div>
  );
}
