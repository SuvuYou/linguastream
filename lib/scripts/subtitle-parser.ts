// TypeScript port of the Python subtitle parser in ml/ingest-subtitles.py

export interface ParsedSubtitleLine {
  index: number;
  start_ms: number;
  end_ms: number;
  text: string;
}

function parseTimestampSrt(ts: string): number {
  const cleaned = ts.trim().replace(",", ".");
  const [h, m, rest] = cleaned.split(":");
  const [s, ms] = rest.split(".");
  return (
    parseInt(h) * 3600000 +
    parseInt(m) * 60000 +
    parseInt(s) * 1000 +
    parseInt(ms.slice(0, 3).padEnd(3, "0")) // normalize to 3 digits
  );
}

function parseTimestampVtt(ts: string): number {
  const cleaned = ts.trim();
  const parts = cleaned.split(":");
  let h = "0",
    m: string,
    rest: string;
  if (parts.length === 3) {
    [h, m, rest] = parts;
  } else {
    [m, rest] = parts;
  }
  const [s, ms] = rest.split(".");
  return (
    parseInt(h) * 3600000 +
    parseInt(m) * 60000 +
    parseInt(s) * 1000 +
    parseInt(ms.slice(0, 3).padEnd(3, "0"))
  );
}

function stripTags(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

export function parseSrt(content: string): ParsedSubtitleLine[] {
  const lines: ParsedSubtitleLine[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const blockLines = block.trim().split("\n");
    if (blockLines.length < 3) continue;

    try {
      const index = parseInt(blockLines[0].trim());
      if (isNaN(index)) continue;

      const times = blockLines[1].trim();
      if (!times.includes("-->")) continue;

      const [startStr, endStr] = times.split("-->");
      const start_ms = parseTimestampSrt(startStr);
      const end_ms = parseTimestampSrt(endStr);

      const text = stripTags(
        blockLines
          .slice(2)
          .map((l) => l.trim())
          .filter(Boolean)
          .join(" "),
      );

      if (text) lines.push({ index, start_ms, end_ms, text });
    } catch {
      continue;
    }
  }

  return lines;
}

export function parseVtt(content: string): ParsedSubtitleLine[] {
  const lines: ParsedSubtitleLine[] = [];

  // strip WEBVTT header line
  const stripped = content.replace(/^WEBVTT[^\n]*\n/, "");
  const blocks = stripped.trim().split(/\n\s*\n/);
  let index = 1;

  for (const block of blocks) {
    const blockLines = block.trim().split("\n");
    if (!blockLines.length) continue;

    // skip NOTE blocks
    if (blockLines[0].startsWith("NOTE")) continue;

    // skip cue identifier line if it has no -->
    let startLine = 0;
    if (!blockLines[0].includes("-->")) startLine = 1;
    if (blockLines.length <= startLine) continue;

    try {
      const times = blockLines[startLine];
      if (!times.includes("-->")) continue;

      const [startStr, endStrRaw] = times.split("-->");
      // strip cue settings from end timestamp (e.g. "00:01.000 align:start")
      const endStr = endStrRaw.trim().split(/\s/)[0];

      const start_ms = parseTimestampVtt(startStr.trim());
      const end_ms = parseTimestampVtt(endStr);

      const text = stripTags(
        blockLines
          .slice(startLine + 1)
          .map((l) => l.trim())
          .filter(Boolean)
          .join(" "),
      );

      if (text) {
        lines.push({ index, start_ms, end_ms, text });
        index++;
      }
    } catch {
      continue;
    }
  }

  return lines;
}

export function parseSubtitleContent(
  content: string,
  format: "srt" | "vtt",
): ParsedSubtitleLine[] {
  return format === "vtt" ? parseVtt(content) : parseSrt(content);
}
