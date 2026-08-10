"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Upload } from "lucide-react";

export default function ChooseStep({ onYouTube }: { onYouTube: () => void }) {
  return (
    <div className="flex flex-col gap-4 pb-4 pt-7">
      <UploadFilesDisabled />
      <YouTubeLink onYouTube={onYouTube} />
    </div>
  );
}

function UploadFilesDisabled() {
  return (
    <div className="flex items-center gap-4 px-4 h-24 border border-primary-border rounded-2xl opacity-40 cursor-not-allowed">
      <div className="w-10 h-10 rounded-full bg-background-hover flex items-center justify-center shrink-0">
        <Upload />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary-foreground pb-0.5">
          Upload Files
        </div>
        <div className="text-xs text-primary-foreground mt-0.5">
          Upload video files or subtitle files from your device
        </div>
      </div>
      <span className="text-xs text-primary-foreground border border-primary-border px-2 py-0.5 rounded-2xl">
        Coming soon
      </span>
    </div>
  );
}

function YouTubeLink({ onYouTube }: { onYouTube: () => void }) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onYouTube}
      className="flex items-center gap-4 h-24 px-4 border border-primary-border rounded-2xl text-left"
    >
      <div className="w-10 h-10 rounded-full bg-red-950 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-red-500"
          fill="currentColor"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary-foreground pb-0.5">
          YouTube Link
        </div>
        <div className="text-xs text-primary-foreground mt-0.5">
          Paste a YouTube link to add online content
        </div>
      </div>
      <ChevronRight />
    </Button>
  );
}
