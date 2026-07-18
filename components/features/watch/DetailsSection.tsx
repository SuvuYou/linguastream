"use client";

import { BookA, SlidersHorizontal } from "lucide-react";
import SubtitleSettingsPanel from "@/components/features/watch/SubtitleSettings";
import WordProfilePanel from "@/components/features/watch/WordProfilePanel/WordProfilePanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAppStore } from "@/lib/initializations/store";

export default function DetailsSection() {
  const { activeWord } = useAppStore();

  const [openedSection, setOpenedSection] = useState<
    "subtitles" | "word-profile" | undefined
  >();

  // auto-open words tab when a word is clicked
  // only if words tab isn't already open
  const prevWord = useAppStore((s) => s.activeWord?.word);

  return (
    <div className="flex gap-2 flex-1 min-h-0 overflow-y-auto mt-2">
      <Tabs
        orientation="vertical"
        value={openedSection}
        onValueChange={(value) =>
          setOpenedSection((prevValue) =>
            prevValue === value
              ? undefined
              : (value as "subtitles" | "word-profile" | undefined),
          )
        }
        className="h-full m-0"
      >
        <TabsList className="h-full! my-0">
          <TabsTrigger
            value="word-profile"
            className="flex-1 text-xs capitalize dark:data-active:bg-primary"
          >
            <BookA className="size-5" />
          </TabsTrigger>
          <TabsTrigger
            value="subtitles"
            className="flex-1 text-xs capitalize dark:data-active:bg-primary"
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

      {openedSection === "word-profile" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <WordProfilePanel />
        </div>
      )}
    </div>
  );
}
