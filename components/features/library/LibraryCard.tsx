"use client";

import Image from "next/image";
import Link from "next/link";
import { useJobPolling } from "@/hooks/useJobPolling";
import { JOB_STATUS } from "@/helpers/const";
import type { MergedContentItem } from "@/types";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";

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

  // — Unavailable state —
  if (!item.jellyfinItem) {
    return (
      <Card className="rounded-none border-r border-b border-t-0 border-l-0 border-primary-border shadow-none">
        <CardContent className="p-4">
          <div className="aspect-video bg-background mb-3 flex items-center justify-center">
            <span className="text-xs text-secondary-text">
              No longer available
            </span>
          </div>
          <div className="text-sm font-medium truncate">{item.title}</div>
        </CardContent>
      </Card>
    );
  }

  // — Processing / error state —
  if (hasActiveJob || isProcessing || isError) {
    return (
      <Card
        ref={elementRef}
        className="rounded-none border-r border-b border-t-0 border-l-0 border-primary-border shadow-none"
      >
        <CardContent className="p-4">
          <div className="aspect-video bg-background mb-3 flex flex-col items-center justify-center gap-3 px-4">
            {isError ? (
              <>
                <Badge variant="destructive" className="font-normal">
                  Subtitle ingestion failed
                </Badge>
                {isAdmin && onOpenConfigModal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenConfigModal(item)}
                  >
                    Reconfigure
                  </Button>
                )}
              </>
            ) : (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetJob()}
                  >
                    Reset job
                  </Button>
                )}
                <Spinner className="size-5 text-active-border" />
                <div className="w-full flex flex-col gap-1.5">
                  <Progress value={jobState.progress} className="h-0.5" />
                  <span className="text-xs text-secondary-text text-center tabular-nums">
                    {jobState.progress}%
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="text-sm font-medium truncate">
            {item.jellyfinItem.Name}
          </div>
          <Badge variant="secondary" className="text-xs font-normal mt-1">
            {item.jellyfinItem.Type}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // — Normal state —
  return (
    <Card className="relative transition-all duration-400 p-0 group rounded-bl-xs hover:rounded-none hover:bg-background hover:cursor-pointer">
      <Link href={`/watch/${item.id}`}>
        <CardContent className="p-0">
          <div className="aspect-video bg-secondary mb-3 overflow-hidden">
            <Image
              src={item.thumbnailUrl}
              alt={item.jellyfinItem.Name}
              className="w-full h-full object-cover opacity-90 duration-400 group-hover:opacity-100 group-hover:scale-110 transition-transform"
              width={1}
              height={1}
              loading="eager"
              unoptimized
            />
          </div>
          <div className="text-base font-medium truncate ml-4">
            {item.jellyfinItem.Name}
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-normal mt-4 ml-4 mb-4"
          >
            {item.jellyfinItem.Type}
          </Badge>
        </CardContent>
      </Link>
      {isAdmin && onOpenConfigModal && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpenConfigModal(item)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all"
        >
          Configure
        </Button>
      )}
    </Card>
  );
}
