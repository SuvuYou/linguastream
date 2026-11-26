"use client";

import type { Line } from "@linguastream/contracts";
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { VideoPlayerControls } from "@/hooks/useVideoPlayer";
import { formatTime, lineTargets, type LineTargets } from "@/lib/watch/lines";
import { useClockValue, type PlaybackClock } from "@/lib/watch/playback-clock";
import SeekBar from "./SeekBar";

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;

const iconButton =
  "flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-raised-2 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-45 disabled:hover:bg-transparent";

function CurrentTime({ clock }: { clock: PlaybackClock }) {
  const seconds = useClockValue(clock, (ms) => Math.floor(ms / 1000));
  return <>{formatTime(seconds * 1000)}</>;
}

const LINE_BUTTONS = [
  { target: "previous", label: "Previous line", key: "A", Icon: SkipBack },
  { target: "repeat", label: "Repeat line", key: "S", Icon: RotateCcw },
  { target: "next", label: "Next line", key: "D", Icon: SkipForward },
] as const;

function LineButtons({
  lines,
  clock,
  onJump,
}: {
  lines: readonly Line[] | null;
  clock: PlaybackClock;
  onJump(target: keyof LineTargets): void;
}) {
  const available = useClockValue(clock, (ms) => {
    if (!lines) return "";
    const targets = lineTargets(lines, ms);
    return LINE_BUTTONS.map((b) =>
      targets[b.target] === null ? "0" : "1",
    ).join("");
  });

  return LINE_BUTTONS.map(({ target, label, key, Icon }, i) => (
    <Tooltip key={target}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => onJump(target)}
          disabled={available[i] !== "1"}
          aria-label={`${label} (${key})`}
          aria-keyshortcuts={key}
          className={iconButton}
        >
          <Icon className="size-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {label}
        <Kbd>{key}</Kbd>
      </TooltipContent>
    </Tooltip>
  ));
}

export default function ControlBar({
  player,
  clock,
  fallbackDurationMs,
  lines,
  onJumpToLine,
}: {
  player: VideoPlayerControls;
  clock: PlaybackClock;
  fallbackDurationMs: number | null;
  lines: readonly Line[] | null;
  onJumpToLine(target: keyof LineTargets): void;
}) {
  const ready = player.status === "ready";
  const durationMs = player.durationMs ?? fallbackDurationMs ?? 0;
  const silent = player.muted || player.volume === 0;

  return (
    <div
      aria-label="Player controls"
      role="group"
      className="flex flex-wrap items-center gap-1 rounded-2xl bg-raised p-1.5 @max-[600px]:rounded-none"
    >
      <SeekBar
        clock={clock}
        durationMs={durationMs}
        disabled={!ready}
        onSeek={player.seek}
      />
      <button
        type="button"
        onClick={player.toggle}
        disabled={!ready}
        aria-label={player.playing ? "Pause (Space)" : "Play (Space)"}
        className="flex size-11 items-center justify-center rounded-lg bg-play text-play-ink transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-45"
      >
        {player.playing ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 fill-current" />
        )}
      </button>
      <LineButtons lines={lines} clock={clock} onJump={onJumpToLine} />
      <span className="px-2 font-mono text-xs text-text-3 tabular-nums">
        <CurrentTime clock={clock} /> / {formatTime(durationMs)}
      </span>
      <span className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={!ready}
          aria-label={`Playback speed: ${player.rate}×`}
          className={`${iconButton} w-auto px-2.5 font-mono text-[13px]`}
        >
          {player.rate}×
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={String(player.rate)}
            onValueChange={(v) => player.setRate(Number(v))}
          >
            {SPEEDS.map((speed) => (
              <DropdownMenuRadioItem
                key={speed}
                value={String(speed)}
                className="font-mono"
              >
                {speed}×
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        type="button"
        onClick={player.toggleMute}
        disabled={!ready}
        aria-label={silent ? "Unmute" : "Mute"}
        className={iconButton}
      >
        {silent ? (
          <VolumeX className="size-5" />
        ) : (
          <Volume2 className="size-5" />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={player.muted ? 0 : player.volume}
        onChange={(event) => player.setVolume(Number(event.target.value))}
        disabled={!ready}
        aria-label="Volume"
        className="mr-2 h-1 w-20 cursor-pointer accent-primary disabled:opacity-45 @max-[600px]:hidden"
      />
    </div>
  );
}
