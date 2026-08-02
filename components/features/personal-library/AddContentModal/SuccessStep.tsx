"use client";

import { Button } from "@/components/ui/button";
import { BanknoteCheck } from "lucide-react";

export default function SuccessStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 pt-4 pb-0">
      <div className="rounded-full bg-active-border/20 flex items-center justify-center">
        <BanknoteCheck className="size-24" />
      </div>
      <div className="text-center mb-4">
        <p className="text-base text-card-foreground mt-1">
          Subtitles are being processed in the background.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onClose} size={"lg"}>
          Close
        </Button>
      </div>
    </div>
  );
}
