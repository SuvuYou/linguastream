#!/usr/bin/env python3
"""
LinguaStream — subtitle ingestion pipeline

Usage:
  python ml/ingest-subtitles.py \
    --media-id <uuid> \
    --source-lang <en|de|...> \
    --acquisition-method <upload|whisperx> \
    [--source-file /path/to/file.srt]       # if acquisition-method=upload
    [--video-file /path/to/video.mp4]       # if acquisition-method=whisperx
    [--translate-langs de,fr,...]           # comma separated, omit for source only
    [--translate-method libretranslate|deepl|upload]
    [--translate-files de:/path/to/de.srt,...] # if translate-method=upload
    --log-file /path/to/job.log
"""

import argparse
import os
import re
import sys
import uuid
import json
import requests
import psycopg2
from datetime import datetime, timezone
from dotenv import load_dotenv

# ── env ────────────────────────────────────────────────────────────────────────

# look for .env.local in project root (one level up from ml/)
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, ".."))
load_dotenv(os.path.join(project_root, ".env.local"))

DATABASE_URL = os.environ["DATABASE_URL"]
WHISPER_SERVICE_URL = os.environ.get("WHISPER_SERVICE_URL", "http://localhost:8001")
LIBRETRANSLATE_URL = os.environ.get("LIBRETRANSLATE_URL", "http://localhost:5000")
DEEPL_API_KEY = os.environ.get("DEEPL_API_KEY", "")

# ── logging ────────────────────────────────────────────────────────────────────

log_file_handle = None

def log(msg: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line, flush=True)
    if log_file_handle:
        log_file_handle.write(line + "\n")
        log_file_handle.flush()

# ── db ─────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(DATABASE_URL)

def set_job_status(media_id: str, status: str, progress: int):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE "MediaContent"
                SET job_status = %s, job_progress = %s
                WHERE id = %s
                """,
                (status, progress, media_id),
            )
        conn.commit()

def detect_language(lines: list[dict], fallback: str) -> str:
    """Detect language from subtitle text. Falls back to provided value if uncertain."""
    try:
        from langdetect import detect, DetectorFactory
        from langdetect.lang_detect_exception import LangDetectException
        DetectorFactory.seed = 0  # deterministic results
        sample = " ".join(line["text"] for line in lines[:20])
        detected = detect(sample)
        log(f"Language detected: {detected}")
        return detected
    except Exception as e:
        log(f"Language detection failed ({e}), falling back to {fallback}")
        return fallback

def update_media_content(media_id: str, source_language: str, acquisition_method: str):
    """Write detected language + acquisition method back to MediaContent."""
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE "MediaContent"
                SET source_language = %s,
                    source_subtitle_acquisition_method = %s
                WHERE id = %s
                """,
                (source_language, acquisition_method, media_id),
            )
        conn.commit()

def delete_subtitle_track(conn, media_id: str, language: str):
    """Delete existing track + all its lines for a given language."""
    with conn.cursor() as cur:
        # get track id first
        cur.execute(
            """
            SELECT id FROM "SubtitleTrack"
            WHERE media_content_id = %s AND translation_language = %s
            """,
            (media_id, language),
        )
        row = cur.fetchone()
        if row:
            track_id = row[0]
            cur.execute('DELETE FROM "SubtitleLine" WHERE subtitle_track_id = %s', (track_id,))
            cur.execute('DELETE FROM "SubtitleTrack" WHERE id = %s', (track_id,))

def insert_track_and_lines(conn, media_id: str, language: str, lines: list[dict]):
    """Insert a SubtitleTrack and all its SubtitleLines in one transaction."""
    track_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO "SubtitleTrack" (id, media_content_id, translation_language, created_at)
            VALUES (%s, %s, %s, %s)
            """,
            (track_id, media_id, language, datetime.now(timezone.utc)),
        )
        for line in lines:
            cur.execute(
                """
                INSERT INTO "SubtitleLine"
                  (id, media_content_id, subtitle_track_id, index, start_ms, end_ms, text)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    str(uuid.uuid4()),
                    media_id,
                    track_id,
                    line["index"],
                    line["start_ms"],
                    line["end_ms"],
                    line["text"],
                ),
            )
    return track_id

# ── subtitle parsing ───────────────────────────────────────────────────────────

def parse_timestamp_srt(ts: str) -> int:
    """Convert SRT timestamp (HH:MM:SS,mmm) to milliseconds."""
    ts = ts.strip().replace(",", ".")
    h, m, rest = ts.split(":")
    s, ms = rest.split(".")
    return int(h) * 3600000 + int(m) * 60000 + int(s) * 1000 + int(ms)

def parse_timestamp_vtt(ts: str) -> int:
    """Convert VTT timestamp (HH:MM:SS.mmm or MM:SS.mmm) to milliseconds."""
    ts = ts.strip()
    parts = ts.split(":")
    if len(parts) == 3:
        h, m, rest = parts
    else:
        h = "0"
        m, rest = parts
    s, ms = rest.split(".")
    return int(h) * 3600000 + int(m) * 60000 + int(s) * 1000 + int(ms)

def parse_srt(content: str) -> list[dict]:
    lines = []
    blocks = re.split(r"\n\s*\n", content.strip())
    for block in blocks:
        block_lines = block.strip().splitlines()
        if len(block_lines) < 3:
            continue
        try:
            index = int(block_lines[0].strip())
            times = block_lines[1].strip()
            start_str, end_str = times.split("-->")
            start_ms = parse_timestamp_srt(start_str)
            end_ms = parse_timestamp_srt(end_str)
            text = " ".join(line.strip() for line in block_lines[2:] if line.strip())
            # strip HTML-like tags (e.g. <i>, <b>)
            text = re.sub(r"<[^>]+>", "", text).strip()
            if text:
                lines.append({"index": index, "start_ms": start_ms, "end_ms": end_ms, "text": text})
        except (ValueError, IndexError):
            continue
    return lines

def parse_vtt(content: str) -> list[dict]:
    lines = []
    # strip WEBVTT header
    content = re.sub(r"^WEBVTT.*?\n", "", content, flags=re.MULTILINE)
    blocks = re.split(r"\n\s*\n", content.strip())
    index = 1
    for block in blocks:
        block_lines = block.strip().splitlines()
        if not block_lines:
            continue
        # skip NOTE blocks
        if block_lines[0].startswith("NOTE"):
            continue
        # skip cue identifier line if present (no --> in it)
        start_line = 0
        if "-->" not in block_lines[0]:
            start_line = 1
        if len(block_lines) <= start_line:
            continue
        try:
            times = block_lines[start_line]
            if "-->" not in times:
                continue
            start_str, end_str = times.split("-->")
            start_ms = parse_timestamp_vtt(start_str.strip())
            end_ms = parse_timestamp_vtt(end_str.strip().split()[0])  # strip cue settings
            text = " ".join(
                line.strip() for line in block_lines[start_line + 1:] if line.strip()
            )
            text = re.sub(r"<[^>]+>", "", text).strip()
            if text:
                lines.append({"index": index, "start_ms": start_ms, "end_ms": end_ms, "text": text})
                index += 1
        except (ValueError, IndexError):
            continue
    return lines

def parse_subtitle_file(path: str) -> list[dict]:
    with open(path, "r", encoding="utf-8-sig") as f:
        content = f.read()
    if path.endswith(".vtt"):
        return parse_vtt(content)
    return parse_srt(content)  # default to SRT for .srt and unknown

def whisperx_segments_to_lines(segments: list[dict]) -> list[dict]:
    """Convert WhisperX segment output to our SubtitleLine format."""
    lines = []
    for i, seg in enumerate(segments):
        text = seg.get("text", "").strip()
        if not text:
            continue
        lines.append({
            "index": i + 1,
            "start_ms": int(seg["start"] * 1000),
            "end_ms": int(seg["end"] * 1000),
            "text": text,
        })
    return lines

# ── transcription ──────────────────────────────────────────────────────────────

def transcribe_with_whisperx(video_path: str, media_id: str) -> tuple[list[dict], str]:
    """Returns (lines, detected_language)."""
    import time

    log(f"Sending {video_path} to WhisperX service (autodetect language)...")
    job_id = str(uuid.uuid4())

    resp = requests.post(
        f"{WHISPER_SERVICE_URL}/transcribe",
        json={"file_path": video_path, "language": None, "job_id": job_id},
        timeout=10,
    )
    resp.raise_for_status()
    log(f"WhisperX job started: {job_id}")

    # progress simulation: crawl from 5% → 28% while waiting
    # stays just below the 30% we set after transcription completes
    simulated = 5
    target = 78
    poll_interval = 5

    while True:
        time.sleep(poll_interval)

        status_resp = requests.get(f"{WHISPER_SERVICE_URL}/job/{job_id}", timeout=5)
        status_resp.raise_for_status()
        data = status_resp.json()
        status = data.get("status")

        if status == "done":
            detected_lang = data.get("detected_language", "unknown")
            log(f"WhisperX transcription complete — {len(data['result'])} segments, language: {detected_lang}")
            return whisperx_segments_to_lines(data["result"]), detected_lang
        elif status == "error":
            raise RuntimeError(f"WhisperX error: {data.get('error')}")
        else:
            if simulated < target:
                simulated = min(simulated + 1, target)
                set_job_status(media_id, "running", simulated)
            log(f"WhisperX status: {status} ({simulated}%)...")

# ── translation ────────────────────────────────────────────────────────────────

LIBRETRANSLATE_LANG_MAP = {
    "en": "en",
    "de": "de",
    "uk": "uk",
    "ru": "ru",
}

DEEPL_LANG_MAP = {
    "en": "EN",
    "de": "DE",
    "uk": "UK",
    "ru": "RU",
}

def translate_libretranslate(lines: list[dict], source_lang: str, target_lang: str) -> list[dict]:
    src = LIBRETRANSLATE_LANG_MAP.get(source_lang, source_lang)
    tgt = LIBRETRANSLATE_LANG_MAP.get(target_lang, target_lang)
    translated = []

    # batch in groups of 50 to avoid request timeouts
    batch_size = 50
    for i in range(0, len(lines), batch_size):
        batch = lines[i:i + batch_size]
        texts = [line["text"] for line in batch]
        log(f"LibreTranslate: translating lines {i+1}–{i+len(batch)} of {len(lines)}...")

        for j, text in enumerate(texts):
            resp = requests.post(
                f"{LIBRETRANSLATE_URL}/translate",
                json={"q": text, "source": src, "target": tgt, "format": "text"},
                timeout=30,
            )
            resp.raise_for_status()
            result = resp.json()
            translated.append({
                **batch[j],
                "text": result["translatedText"],
            })

    return translated

def translate_deepl(lines: list[dict], source_lang: str, target_lang: str) -> list[dict]:
    src = DEEPL_LANG_MAP.get(source_lang, source_lang.upper())
    tgt = DEEPL_LANG_MAP.get(target_lang, target_lang.upper())

    # DeepL supports batching up to 50 texts per request
    translated = []
    batch_size = 50
    for i in range(0, len(lines), batch_size):
        batch = lines[i:i + batch_size]
        texts = [line["text"] for line in batch]
        log(f"DeepL: translating lines {i+1}–{i+len(batch)} of {len(lines)}...")

        resp = requests.post(
            "https://api-free.deepl.com/v2/translate",
            headers={"Authorization": f"DeepL-Auth-Key {DEEPL_API_KEY}"},
            json={"text": texts, "source_lang": src, "target_lang": tgt},
            timeout=30,
        )
        resp.raise_for_status()
        results = resp.json()["translations"]

        for j, result in enumerate(results):
            translated.append({
                **batch[j],
                "text": result["text"],
            })

    return translated

# ── main ───────────────────────────────────────────────────────────────────────

def main():
    global log_file_handle

    parser = argparse.ArgumentParser(description="LinguaStream subtitle ingestion pipeline")
    parser.add_argument("--media-id", required=True)
    parser.add_argument("--source-lang", required=True)  # fallback if detection fails
    parser.add_argument("--acquisition-method", required=True, choices=["upload", "whisperx"])
    parser.add_argument("--source-file", default=None)
    parser.add_argument("--video-file", default=None)
    parser.add_argument("--translate-langs", default=None)  # comma separated
    parser.add_argument("--translate-method", default=None, choices=["libretranslate", "deepl", "upload"])
    parser.add_argument("--translate-files", default=None)  # "de:/path,fr:/path"
    parser.add_argument("--log-file", required=True)
    args = parser.parse_args()

    # open log file
    os.makedirs(os.path.dirname(args.log_file), exist_ok=True)
    log_file_handle = open(args.log_file, "a", encoding="utf-8")

    try:
        log(f"Starting ingestion for media {args.media_id}")
        set_job_status(args.media_id, "running", 0)

        # ── source subtitles ───────────────────────────────────────────────────

        detected_lang: str

        if args.acquisition_method == "upload":
            if not args.source_file:
                raise ValueError("--source-file required when acquisition-method=upload")
            log(f"Parsing source subtitle file: {args.source_file}")
            source_lines = parse_subtitle_file(args.source_file)
            log(f"Parsed {len(source_lines)} source lines")
            detected_lang = detect_language(source_lines, fallback=args.source_lang)

        elif args.acquisition_method == "whisperx":
            if not args.video_file:
                raise ValueError("--video-file required when acquisition-method=whisperx")
            log("Starting WhisperX transcription...")
            source_lines, detected_lang = transcribe_with_whisperx(args.video_file, args.media_id)

        set_job_status(args.media_id, "running", 80)
        log(f"Source subtitles ready — {len(source_lines)} lines, language: {detected_lang}")

        # ── write detected language + acquisition method back to MediaContent ──

        log(f"Updating MediaContent: source_language={detected_lang}, acquisition_method={args.acquisition_method}")
        update_media_content(args.media_id, detected_lang, args.acquisition_method)

        # ── store source track ─────────────────────────────────────────────────

        log(f"Writing source track ({detected_lang}) to DB...")
        with get_conn() as conn:
            delete_subtitle_track(conn, args.media_id, detected_lang)
            insert_track_and_lines(conn, args.media_id, detected_lang, source_lines)
            conn.commit()
        log("Source track saved")

        set_job_status(args.media_id, "running", 90)

        # ── translated tracks ──────────────────────────────────────────────────

        if args.translate_langs and args.translate_method:
            translate_langs = [l.strip() for l in args.translate_langs.split(",") if l.strip()]

            # parse translate-files map if provided
            translate_files_map: dict[str, str] = {}
            if args.translate_files:
                for pair in args.translate_files.split(","):
                    lang, path = pair.split(":", 1)
                    translate_files_map[lang.strip()] = path.strip()

            total_langs = len(translate_langs)
            for lang_index, target_lang in enumerate(translate_langs):
                log(f"Processing translation: {detected_lang} → {target_lang}")

                if args.translate_method == "upload":
                    path = translate_files_map.get(target_lang)
                    if not path:
                        log(f"⚠️  No file provided for {target_lang} — skipping")
                        continue
                    translated_lines = parse_subtitle_file(path)
                    log(f"Parsed {len(translated_lines)} lines for {target_lang}")

                elif args.translate_method == "libretranslate":
                    translated_lines = translate_libretranslate(source_lines, args.source_lang, target_lang)

                elif args.translate_method == "deepl":
                    translated_lines = translate_deepl(source_lines, args.source_lang, target_lang)

                log(f"Writing {target_lang} track to DB...")
                with get_conn() as conn:
                    delete_subtitle_track(conn, args.media_id, target_lang)
                    insert_track_and_lines(conn, args.media_id, target_lang, translated_lines)
                    conn.commit()
                log(f"{target_lang} track saved")

                # progress: 50–90 spread across translation langs
                progress = 90 + int(9 * (lang_index + 1) / total_langs)
                set_job_status(args.media_id, "running", progress)

        # ── done ──────────────────────────────────────────────────────────────

        set_job_status(args.media_id, "done", 100)
        log("✅ Ingestion complete")

    except Exception as e:
        log(f"❌ Error: {e}")
        try:
            set_job_status(args.media_id, "error", 0)
        except Exception:
            pass
        sys.exit(1)

    finally:
        if log_file_handle:
            log_file_handle.close()


if __name__ == "__main__":
    main()