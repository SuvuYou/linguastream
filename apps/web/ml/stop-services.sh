#!/bin/bash

# LinguaStream — stop local ML services

LOG_DIR="$PWD/ml/logs"

stop_service() {
  local name=$1
  local pid_file="$LOG_DIR/$2.pid"

  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      rm "$pid_file"
      echo "✅  $name stopped (pid $pid)"
    else
      echo "⚠️   $name pid $pid not running — cleaning up"
      rm "$pid_file"
    fi
  else
    echo "⚠️   $name pid file not found — may not have been started with this script"
  fi
}

stop_service "WhisperX service" "whisper"
stop_service "LibreTranslate" "libretranslate"

echo ""
echo "🛑  ML services stopped"