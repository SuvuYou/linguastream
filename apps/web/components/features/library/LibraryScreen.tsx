"use client";

import type { LibraryVideo } from "@linguastream/contracts";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import PaginationControls from "@/components/primitives/PaginationControls";
import { useLibrary } from "@/hooks/useLibrary";
import { cardState } from "@/lib/library/card-state";
import LibrarySearch from "./LibrarySearch";
import VideoCard from "./VideoCard";

function readPage(value: string | null) {
  const page = Number(value ?? 1);
  return Number.isInteger(page) && page >= 1 ? page - 1 : 0;
}

function Grid({ children, busy }: { children: React.ReactNode; busy?: boolean }) {
  return (
    <div
      aria-busy={busy}
      className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 max-[560px]:grid-cols-1"
    >
      {children}
    </div>
  );
}

function SkeletonCards() {
  return (
    <Grid busy>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2.5" aria-hidden="true">
          <div className="aspect-video animate-pulse rounded-xl bg-raised motion-reduce:animate-none" />
          <div className="h-4 w-4/5 animate-pulse rounded-sm bg-raised motion-reduce:animate-none" />
          <div className="h-3 w-1/2 animate-pulse rounded-sm bg-raised motion-reduce:animate-none" />
        </div>
      ))}
    </Grid>
  );
}

function Message({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <p className="text-base font-semibold">{title}</p>
      {children}
    </div>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = readPage(searchParams.get("page"));
  const search = searchParams.get("q")?.trim() ?? "";
  const { videos, events, retry } = useLibrary(page, search);

  const navigate = useCallback(
    (next: { page?: number; q?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const q = next.q ?? search;
      const p = next.page ?? page;
      if (q) params.set("q", q);
      else params.delete("q");
      if (p > 0) params.set("page", String(p + 1));
      else params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [page, pathname, router, search, searchParams],
  );

  const data = videos.data;
  const pageCount = data ? Math.ceil(data.total / data.page_size) : 0;

  const retryFor = (video: LibraryVideo) => {
    const trackId = events[video.id]?.track_id ?? video.track?.id;
    if (trackId) retry.mutate({ video, trackId });
  };

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 p-6 max-[560px]:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-[26px] leading-tight font-bold">Library</h1>
        <LibrarySearch
          value={search}
          onChange={(q) => {
            if (q !== search) navigate({ q, page: 0 });
          }}
        />
      </div>

      {videos.isPending ? (
        <SkeletonCards />
      ) : videos.isError && !data ? (
        <Message title="Couldn't load your library">
          <span className="mt-2 text-sm font-semibold">
            <button
              type="button"
              onClick={() => void videos.refetch()}
              className="h-9 rounded-md bg-raised-2 px-4 hover:bg-raised focus-visible:outline-2 focus-visible:outline-ring"
            >
              Try again
            </button>
          </span>
        </Message>
      ) : data && data.total === 0 ? (
        search ? (
          <Message title={`No videos match “${search}”`}>
            <p className="text-sm text-text-2">Try another word from the title or channel.</p>
          </Message>
        ) : (
          <Message title="Your library is empty">
            <p className="max-w-md text-sm text-text-2">
              Open a German video on YouTube and send it with the LinguaStream
              extension. It shows up here while it&apos;s being prepared.
            </p>
          </Message>
        )
      ) : data && data.items.length === 0 ? (
        <Message title="This page is empty">
          <span className="mt-2 text-sm font-semibold">
            <button
              type="button"
              onClick={() => navigate({ page: 0 })}
              className="h-9 rounded-md bg-raised-2 px-4 hover:bg-raised focus-visible:outline-2 focus-visible:outline-ring"
            >
              Go to the first page
            </button>
          </span>
        </Message>
      ) : (
        data && (
          <>
            <Grid busy={videos.isPlaceholderData}>
              {data.items.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  state={cardState(video, events[video.id])}
                  retrying={retry.isPending && retry.variables?.video.id === video.id}
                  retryFailed={retry.isError && retry.variables?.video.id === video.id}
                  onRetry={() => retryFor(video)}
                />
              ))}
            </Grid>
            <PaginationControls
              key={page}
              page={page}
              pageCount={pageCount}
              onPageChange={(p) => navigate({ page: p })}
            />
          </>
        )
      )}
    </section>
  );
}
