import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const VENV_PYTHON = path.join(
  process.env.HOME ?? "~",
  "linguastream-ml",
  "bin",
  "python",
);

const INGEST_SCRIPT = path.join(process.cwd(), "ml", "ingest-subtitles.py");

const LOG_DIR = path.join(process.cwd(), "ml", "logs");

export interface IngestArgs {
  mediaId: string;
  sourceLang: string;
  acquisitionMethod: "upload" | "whisperx";
  sourceFile?: string; // path on disk — required if acquisitionMethod=upload
  videoFile?: string; // path on disk — required if acquisitionMethod=whisperx
  translateLangs?: string[];
  translateMethod?: "libretranslate" | "deepl" | "upload";
  translateFiles?: Record<string, string>; // { de: "/path/to/de.srt" }
}

/**
 * Spawns the ingest-subtitles.py script as a detached background process.
 * Returns immediately — caller polls /api/jobs/[mediaId] for progress.
 */
export function spawnIngest(args: IngestArgs): { logFile: string } {
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const logFile = path.join(LOG_DIR, `${args.mediaId}.log`);

  const argv: string[] = [
    INGEST_SCRIPT,
    "--media-id",
    args.mediaId,
    "--source-lang",
    args.sourceLang,
    "--acquisition-method",
    args.acquisitionMethod,
    "--log-file",
    logFile,
  ];

  if (args.acquisitionMethod === "upload") {
    if (!args.sourceFile)
      throw new Error("sourceFile required for upload method");
    argv.push("--source-file", args.sourceFile);
  }

  if (args.acquisitionMethod === "whisperx") {
    if (!args.videoFile)
      throw new Error("videoFile required for whisperx method");
    argv.push("--video-file", args.videoFile);
  }

  if (
    args.translateLangs &&
    args.translateLangs.length > 0 &&
    args.translateMethod
  ) {
    argv.push("--translate-langs", args.translateLangs.join(","));
    argv.push("--translate-method", args.translateMethod);

    if (args.translateMethod === "upload" && args.translateFiles) {
      const pairs = Object.entries(args.translateFiles)
        .map(([lang, filePath]) => `${lang}:${filePath}`)
        .join(",");
      argv.push("--translate-files", pairs);
    }
  }

  const child = spawn(VENV_PYTHON, argv, {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
  });

  // detach so the process outlives the API route handler
  child.unref();

  return { logFile };
}
