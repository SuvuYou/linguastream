"use client";

import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import SidebarSubtitleSection from "./SidebarSubtitleSection";
import { BookA, Captions, SlidersHorizontal } from "lucide-react";
import SubtitleSettingsPanel from "@/components/features/watch/SubtitleSettings";
import WordProfilePanel from "@/components/features/watch/WordProfilePanel/WordProfilePanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import Events from "@/events";

interface SubtitleSidebarProps {
  currentTimeMs: number;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  isLoading: boolean;
}

type Sections = "subtitles" | "word-profile" | "subtitle-settings";

export default function SubtitleSidebar(props: SubtitleSidebarProps) {
  const { currentTimeMs, sourceLines, translationLines, isLoading } = props;
  const subtitleSectionProps = {
    currentTimeMs,
    sourceLines,
    translationLines,
    isLoading,
  };

  const [openedSection, setOpenedSection] = useState<Sections>("subtitles");

  useEffect(() => {
    const onSelectWord = ({ state }: { state: "select" | "deselect" }) => {
      if (state === "select") setOpenedSection("word-profile");
    };

    const unsubscribe = Events.subtitles.onSelectWord(onSelectWord);

    return () => unsubscribe();
  }, []);

  return (
    <Sidebar
      side="right"
      collapsible="none"
      className="h-screen"
      style={{ "--sidebar-width": "24rem" } as React.CSSProperties}
    >
      <SidebarHeader>
        <Tabs
          value={openedSection}
          onValueChange={(value) => setOpenedSection(value as Sections)}
          className="w-full h-12"
        >
          <TabsList className="w-full h-12!">
            <TabsTrigger
              value="subtitles"
              className="flex-1 text-xs capitalize dark:data-active:bg-primary"
            >
              <Captions className="size-6" />
            </TabsTrigger>
            <TabsTrigger
              value="word-profile"
              className="flex-1 text-xs capitalize dark:data-active:bg-primary"
            >
              <BookA className="size-6" />
            </TabsTrigger>
            <TabsTrigger
              value="subtitle-settings"
              className="flex-1 text-xs capitalize dark:data-active:bg-primary"
            >
              <SlidersHorizontal className="size-6" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </SidebarHeader>

      <SidebarContent className="mb-3 overflow-hidden">
        {openedSection === "subtitles" && (
          <div
            id="subtitle-settings-panel"
            className="flex-1 min-h-0 overflow-y-auto"
          >
            <SidebarSubtitleSection {...subtitleSectionProps} />
          </div>
        )}

        {openedSection === "word-profile" && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <WordProfilePanel />
          </div>
        )}

        {openedSection === "subtitle-settings" && (
          <div
            id="subtitle-settings-panel"
            className="flex-1 min-h-0 overflow-y-auto"
          >
            <SubtitleSettingsPanel />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
