"use client";

import { useMemo } from "react";
import type { SubtitleLine } from "@/hooks/useSubtitleTrack";
import {
  ActiveWord,
  useAppStore,
  type SubtitleSettings,
} from "@/lib/initializations/store";

interface SubtitleOverlayProps {
  currentTimeMs: number;
  sourceLines: SubtitleLine[];
  translationLines: SubtitleLine[];
  settings: SubtitleSettings;
  handleSubtitleWordClick: (
    clean: string,
    line: SubtitleLine,
    contextTranslation: string,
    contextLines: SubtitleLine[],
  ) => void;
}

const FONT_SIZE_MAP = {
  small: "0.85rem",
  medium: "1.1rem",
  large: "1.4rem",
};

function cleanWord(raw: string): string {
  return raw.replace(/[^\p{L}\p{N}-]/gu, "").toLowerCase();
}

function findActiveLine(
  lines: SubtitleLine[],
  currentTimeMs: number,
): [SubtitleLine | null, number] {
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
      return [line, mid];
    }
  }

  return [null, 0];
}

function ClickableSubtitleLine({
  text,
  fontSize,
  settings,
  activeWord,
  handleSubtitleWordClick,
}: {
  text: string;
  fontSize: string;
  settings: SubtitleSettings;
  activeWord: ActiveWord | null;
  handleSubtitleWordClick: (word: string) => void;
}) {
  const words = text.split(/(\s+)/);
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
        {words.map((chunk, i) => {
          if (/^\s+$/.test(chunk)) return <span key={i}>{chunk}</span>;
          const clean = cleanWord(chunk);
          if (!clean) return <span key={i}>{chunk}</span>;

          const isActive = activeWord?.word === clean;

          return (
            <span
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                handleSubtitleWordClick(clean);
              }}
              className={`cursor-pointer transition-colors pointer-events-auto ${
                isActive
                  ? "text-active-border underline underline-offset-2"
                  : "hover:text-active-border"
              }`}
            >
              {chunk}
            </span>
          );
        })}
      </span>
    </div>
  );
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
  handleSubtitleWordClick,
}: SubtitleOverlayProps) {
  const { activeWord } = useAppStore();

  const [activeSrc, activeSrcIndex] = useMemo(
    () => findActiveLine(sourceLines, currentTimeMs),
    [sourceLines, currentTimeMs],
  );

  const [activeTrans] = useMemo(
    () => findActiveLine(translationLines, currentTimeMs),
    [translationLines, currentTimeMs],
  );

  const hasAnything =
    (settings.showSource && activeSrc) ||
    (settings.showTranslation && activeTrans);

  if (!hasAnything)
    return (
      <div
        data-testid="empty-state"
        className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none z-10"
      ></div>
    );

  return (
    <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none z-10">
      {settings.showSource && activeSrc && (
        <ClickableSubtitleLine
          text={activeSrc.text}
          fontSize={FONT_SIZE_MAP[settings.sourceFontSize]}
          settings={settings}
          activeWord={activeWord}
          handleSubtitleWordClick={(word: string) =>
            activeTrans &&
            handleSubtitleWordClick(word, activeSrc, activeTrans?.text, [
              ...(activeSrcIndex - 1 >= 0
                ? [sourceLines[activeSrcIndex - 1]]
                : []),
              sourceLines[activeSrcIndex],
              ...(activeSrcIndex + 1 < sourceLines.length
                ? [sourceLines[activeSrcIndex + 1]]
                : []),
            ])
          }
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
