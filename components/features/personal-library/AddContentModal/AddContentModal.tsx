"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChooseStep from "./ChooseStep";
import { URLStep } from "./URLStep";
import ConfigurationStep from "./ConfigurationStep";
import SuccessStep from "./SuccessStep";

type Step = "choose" | "url" | "configure" | "success";

interface YouTubeMetadata {
  title: string;
  videoId: string;
  thumbnailUrl: string;
}

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddContentModal({
  isOpen,
  onClose,
}: AddContentModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("choose");
  const [ytMeta, setYtMeta] = useState<YouTubeMetadata | null>(null);
  const [successMediaId, setSuccessMediaId] = useState<string | null>(null);

  const titles: Record<Step, string> = {
    choose: "Add Content",
    url: "YouTube Link",
    configure: "Configure Subtitles",
    success: "Content Added",
  };

  function handleSuccess(mediaId: string) {
    setSuccessMediaId(mediaId);
    setStep("success");
    queryClient.invalidateQueries({ queryKey: ["personal-library"] });
  }

  const handleClose = () => {
    setStep("choose");
    setYtMeta(null);
    setSuccessMediaId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-medium">
            {titles[step]}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="px-6 pb-6">
            {step === "choose" && (
              <ChooseStep onYouTube={() => setStep("url")} />
            )}
            {step === "url" && (
              <URLStep
                onBack={() => setStep("choose")}
                onNext={(meta) => {
                  setYtMeta(meta);
                  setStep("configure");
                }}
              />
            )}
            {step === "configure" && ytMeta && (
              <ConfigurationStep
                meta={ytMeta}
                onBack={() => setStep("url")}
                onSuccess={handleSuccess}
              />
            )}
            {step === "success" && successMediaId && (
              <SuccessStep mediaId={successMediaId} onClose={handleClose} />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
