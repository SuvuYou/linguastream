"use client";

import { useState, useMemo } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import { useAppStore } from "@/lib/initializations/store";
import { Badge } from "@/components/ui/badge";
import SubtitleList from "./SubtitleList";
import { SidebarInput, SidebarGroup } from "@/components/ui/sidebar";

interface SubtitleSidebarProps {
  currentTimeMs: number;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  isLoading: boolean;
}

export default function SidebarSubtitleSection({
  currentTimeMs,
  sourceLines,
  translationLines,
  isLoading,
}: SubtitleSidebarProps) {
  const { subtitleSettings } = useAppStore();

  const [query, setQuery] = useState("");

  const shouldShowSourceLine =
    subtitleSettings.showSource && sourceLines.length > 0;
  const shouldShowTranslationLine =
    subtitleSettings.showTranslation && translationLines.length > 0;

  const subtitlePairs = useMemo(() => {
    const maxLen = Math.max(sourceLines.length, translationLines.length);

    return Array.from({ length: maxLen }, (_, i) => ({
      source: sourceLines[i] ?? null,
      translation: translationLines[i] ?? null,
      start_ms: sourceLines[i]?.start_ms ?? translationLines[i]?.start_ms ?? 0,
      end_ms: sourceLines[i]?.end_ms ?? translationLines[i]?.end_ms ?? 0,
      index: i,
    }));
  }, [sourceLines, translationLines]);

  const filteredSubtitlePairs = useMemo(() => {
    if (!query.trim()) return subtitlePairs;

    const q = query.toLowerCase();
    return subtitlePairs.filter((pair) => {
      if (shouldShowSourceLine && pair.source?.text.toLowerCase().includes(q))
        return true;
      if (
        shouldShowTranslationLine &&
        pair.translation?.text.toLowerCase().includes(q)
      )
        return true;
      return false;
    });
  }, [subtitlePairs, query, shouldShowSourceLine, shouldShowTranslationLine]);

  return (
    <>
      <div>
        <div className="px-3 py-2">
          <SidebarInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subtitles..."
          />
        </div>

        <div className="px-3 py-1.5 flex items-center">
          <Badge className="text-xs font-normal">
            {query.trim()
              ? `${filteredSubtitlePairs.length} result${filteredSubtitlePairs.length !== 1 ? "s" : ""}`
              : `${subtitlePairs.length} lines`}
          </Badge>
        </div>
      </div>

      <div className="mb-3 overflow-hidden">
        <SidebarGroup className="h-full pl-0">
          <SubtitleList
            query={query}
            currentTimeMs={currentTimeMs}
            subtitlePairs={subtitlePairs}
            filteredSubtitlePairs={filteredSubtitlePairs}
            shouldShowSourceLine={shouldShowSourceLine}
            shouldShowTranslationLine={shouldShowTranslationLine}
            isLoading={isLoading}
          />
        </SidebarGroup>
      </div>
    </>
  );
}
