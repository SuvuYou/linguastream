"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

interface YouTubeMetadata {
  title: string;
  videoId: string;
  thumbnailUrl: string;
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com"))
      return parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return null;
  } catch {
    return null;
  }
}

export function URLStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (meta: YouTubeMetadata) => void;
}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetchMetadata() {
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      );
      if (!res.ok) {
        setError("Could not fetch video info. Check the URL and try again.");
        return;
      }
      const data = await res.json();
      onNext({
        title: data.title,
        videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    } catch {
      setError("Failed to fetch video info.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-6">
      <InputGroup className="min-w-48 max-w-196 flex items-center gap-2 border border-primary-border px-3 py-4 my-2">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-red-500 shrink-0"
          fill="currentColor"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <InputGroupInput
          value={url}
          id="yt-url"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleFetchMetadata();
          }}
          autoFocus
        />
      </InputGroup>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleFetchMetadata}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <>
              <Spinner className="size-3.5 mr-2" />
              Fetching...
            </>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
}
