"use client";

import { useMemo } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import type { SubtitleSettings } from "@/lib/initializations/store";

interface SubtitleOverlayProps {
  currentTimeMs: number;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  settings: SubtitleSettings;
}

const FONT_SIZE_MAP = {
  small: "0.85rem",
  medium: "1.1rem",
  large: "1.4rem",
};

function findActiveLine(
  lines: SubtitleLine[],
  currentTimeMs: number,
): SubtitleLine | null {
  // binary search for active line
  let lo = 0;
  let hi = lines.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const line = lines[mid];
    if (currentTimeMs < line.start_ms) {
      hi = mid - 1;
    } else if (currentTimeMs > line.end_ms) {
      lo = mid + 1;
    } else {
      return line;
    }
  }

  return null;
}

function SubtitleLine({
  text,
  fontSize,
  settings,
}: {
  text: string;
  fontSize: string;
  settings: SubtitleSettings;
}) {
  const bgStyle = {
    backgroundColor: settings.backgroundColor,
    opacity: settings.backgroundOpacity,
  };

  return (
    <div className="relative inline-block max-w-[90%] text-center">
      <div className="absolute inset-0 rounded" style={bgStyle} />
      <span
        className="relative px-2 py-0.5 rounded"
        style={{
          fontSize,
          color: settings.fontColor,
          opacity: settings.fontOpacity,
          lineHeight: 1.4,
          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
        }}
      >
        {text}
      </span>
    </div>
  );
}

export default function SubtitleOverlay({
  currentTimeMs,
  sourceLines,
  translationLines,
  settings,
}: SubtitleOverlayProps) {
  const activeSrc = useMemo(
    () => findActiveLine(sourceLines, currentTimeMs),
    [sourceLines, currentTimeMs],
  );

  const activeTrans = useMemo(
    () => findActiveLine(translationLines, currentTimeMs),
    [translationLines, currentTimeMs],
  );

  const hasAnything =
    (settings.showSource && activeSrc) ||
    (settings.showTranslation && activeTrans);

  if (!hasAnything) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none z-10">
      {settings.showSource && activeSrc && (
        <SubtitleLine
          text={activeSrc.text}
          fontSize={FONT_SIZE_MAP[settings.sourceFontSize]}
          settings={settings}
        />
      )}
      {settings.showTranslation && activeTrans && (
        <SubtitleLine
          text={activeTrans.text}
          fontSize={FONT_SIZE_MAP[settings.translationFontSize]}
          settings={settings}
        />
      )}
    </div>
  );
}
