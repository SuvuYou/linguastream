"use client";

import Image from "next/image";
import Link from "next/link";
import {
  JOB_STATUS,
  YOUTUBE_CONTENT_TYPE,
  UPLOAD_CONTENT_TYPE,
} from "@/helpers/const";
import { useJobPolling } from "@/hooks/useJobPolling";
import { DeleteMediaButton } from "./DeleteMediaButton";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RefObject } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  if (isProcessing) {
    return (
      <CardFrame elementRef={elementRef} item={item} isClickable={isClickable}>
        <div className="aspect-video flex flex-col items-center justify-center gap-3 px-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div className="w-full">
            <div className="text-xs text-primary-foreground mt-1.5 text-center tabular-nums">
              {jobState.progress}%
            </div>
          </div>
        </div>
        <div className="w-full pb-2">
          <div
            className="h-0.5 bg-vibrant transition-all duration-500"
            style={{ width: `${jobState.progress}%` }}
          />
        </div>
        <div className="text-base font-medium truncate text-primary-foreground p-4 pt-1">
          {item.title}
        </div>
      </CardFrame>
    );
  }

  return (
    <CardFrame elementRef={elementRef} item={item} isClickable={isClickable}>
      <div
        className={cn(
          "aspect-video mb-3 overflow-hidden relative",
          isClickable ? "bg-background" : "bg-under-construction",
        )}
      >
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            className={cn(
              "w-full h-full object-cover",
              isClickable ? "opacity-90" : "opacity-30",
            )}
            width={320}
            height={180}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-primary-foreground text-xs">
            {item.type === UPLOAD_CONTENT_TYPE
              ? "Uploaded file"
              : "No thumbnail"}
          </div>
        )}
      </div>

      <div className="text-base font-medium truncate text-primary-foreground p-4 pt-1">
        {item.title}
      </div>
    </CardFrame>
  );
}

function CardFrame({
  elementRef,
  children,
  item,
  isClickable,
}: {
  elementRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  item: PersonalItem;
  isClickable: boolean;
}) {
  return (
    <Card
      ref={elementRef}
      className="relative transition-all duration-400 p-0 group rounded-bl-xs hover:rounded-none hover:bg-background hover:cursor-pointer"
    >
      <Link href={isClickable ? `/watch/${item.id}` : "#"}>
        <CardContent className="p-0">{children}</CardContent>
      </Link>
      <div className="absolute top-2 left-2">
        <Badge
          className={cn(
            "font-bold",
            item.type === YOUTUBE_CONTENT_TYPE
              ? "bg-red-500/60"
              : "bg-green-500/60",
          )}
          size="sm"
        >
          {item.type === YOUTUBE_CONTENT_TYPE ? "YT" : "Upload"}
        </Badge>
      </div>
      <DeleteMediaButton mediaId={item.id} title={item.title} />
    </Card>
  );
}
