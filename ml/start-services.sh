#!/bin/bash

# LinguaStream — start local ML services
# Run from project root: bash ml/start-services.sh

set -e

VENV_PATH="$HOME/linguastream-ml"
WHISPER_SERVICE="$PWD/ml/whisper_service.py"
WHISPER_PORT=8001
LIBRETRANSLATE_PORT=5000
LOG_DIR="$PWD/ml/logs"

mkdir -p "$LOG_DIR"

# ── helpers ────────────────────────────────────────────────────────────────────

check_port() {
  lsof -i ":$1" &>/dev/null
}

print_status() {
  echo "  $1"
}

# ── activate venv ──────────────────────────────────────────────────────────────

if [ ! -d "$VENV_PATH" ]; then
  echo "❌  Virtual environment not found at $VENV_PATH"
  echo "    Run: python -m venv $VENV_PATH && source $VENV_PATH/bin/activate && pip install whisperx fastapi uvicorn libretranslate"
  exit 1
fi

source "$VENV_PATH/bin/activate"
echo "✅  Virtual environment activated"

# ── WhisperX service ───────────────────────────────────────────────────────────

if check_port $WHISPER_PORT; then
  print_status "⚠️  WhisperX service already running on port $WHISPER_PORT — skipping"
else
  print_status "🎙  Starting WhisperX service on port $WHISPER_PORT..."
  uvicorn ml.whisper_service:app \
    --port $WHISPER_PORT \
    --log-level info \
    > "$LOG_DIR/whisper.log" 2>&1 &
  WHISPER_PID=$!
  echo $WHISPER_PID > "$LOG_DIR/whisper.pid"

  # wait for it to be ready
  for i in {1..10}; do
    if curl -s "http://localhost:$WHISPER_PORT/health" &>/dev/null; then
      print_status "✅  WhisperX service ready (pid $WHISPER_PID)"
      break
    fi
    sleep 1
    if [ $i -eq 10 ]; then
      print_status "❌  WhisperX service failed to start — check $LOG_DIR/whisper.log"
      exit 1
    fi
  done
fi

# ── LibreTranslate ─────────────────────────────────────────────────────────────

if check_port $LIBRETRANSLATE_PORT; then
  print_status "⚠️  LibreTranslate already running on port $LIBRETRANSLATE_PORT — skipping"
else
  print_status "🌍  Starting LibreTranslate on port $LIBRETRANSLATE_PORT (EN + DE)..."
  libretranslate \
    --load-only en,de \
    --port $LIBRETRANSLATE_PORT \
    > "$LOG_DIR/libretranslate.log" 2>&1 &
  LT_PID=$!
  echo $LT_PID > "$LOG_DIR/libretranslate.pid"

  # LibreTranslate takes longer to boot (model loading)
  print_status "⏳  Waiting for LibreTranslate to load models (this may take ~30s on first run)..."
  for i in {1..30}; do
    if curl -s "http://localhost:$LIBRETRANSLATE_PORT/languages" &>/dev/null; then
      print_status "✅  LibreTranslate ready (pid $LT_PID)"
      break
    fi
    sleep 2
    if [ $i -eq 30 ]; then
      print_status "❌  LibreTranslate failed to start — check $LOG_DIR/libretranslate.log"
      exit 1
    fi
  done
fi

# ── summary ────────────────────────────────────────────────────────────────────

echo ""
echo "🚀  ML services running:"
echo "    WhisperX     → http://localhost:$WHISPER_PORT"
echo "    LibreTranslate → http://localhost:$LIBRETRANSLATE_PORT"
echo ""
echo "    Logs: $LOG_DIR/"
echo "    Stop: bash ml/stop-services.sh"