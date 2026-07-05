"use client";

import { BookA, SlidersHorizontal } from "lucide-react";
import SubtitleSettingsPanel from "@/components/features/watch/SubtitleSettings";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function DetailsSection() {
  const [openedSection, setOpenedSection] = useState<
    "subtitles" | "words" | undefined
  >();

  return (
    <div className="flex gap-2 flex-1 min-h-0 overflow-y-auto mt-2">
      <Tabs
        orientation="vertical"
        value={openedSection}
        onValueChange={(value) =>
          setOpenedSection((prevValue) =>
            prevValue === value
              ? undefined
              : (value as "subtitles" | "words" | undefined),
          )
        }
        className="h-full m-0"
      >
        <TabsList className="h-full! my-0">
          <TabsTrigger value={"word"} className="flex-1 text-xs capitalize">
            <BookA className="size-5" />
          </TabsTrigger>
          <TabsTrigger
            value={"subtitles"}
            className="flex-1 text-xs capitalize"
          >
            <SlidersHorizontal className="size-5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {openedSection === "subtitles" && (
        <div
          id="subtitle-settings-panel"
          className="flex-1 min-h-0 overflow-y-auto"
        >
          <SubtitleSettingsPanel />
        </div>
      )}
    </div>
  );
}
