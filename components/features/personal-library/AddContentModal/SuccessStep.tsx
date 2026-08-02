"use client";

import { Button } from "@/components/ui/button";

export default function SuccessStep({
  mediaId,
  onClose,
}: {
  mediaId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-12 h-12 rounded-full bg-active-border/20 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-6 h-6 text-active-border"
        >
          <polyline
            points="20 6 9 17 4 12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary-text">Content Added</p>
        <p className="text-xs text-secondary-text mt-1">
          Subtitles are being processed in the background.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button asChild>
          <a href={`/watch/${mediaId}`}>View in Library</a>
        </Button>
      </div>
    </div>
  );
}
