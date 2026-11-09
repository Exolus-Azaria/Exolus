#!/data/data/com.termux/files/usr/bin/bash
set -u
cd "$(dirname "$0")" || exit 1
export PATH="/data/data/com.termux/files/usr/bin:$PATH"
LOG="$PWD/exolus-server.log"
PIDFILE="$PWD/exolus-server.pid"
if ! command -v node >/dev/null 2>&1; then echo "Node.js belum ditemukan."; exit 1; fi
if ! command -v hermes >/dev/null 2>&1; then echo "Hermes CLI belum ditemukan di PATH Termux."; exit 1; fi
if [ -f "$PIDFILE" ]; then
  oldpid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "$oldpid" ] && kill -0 "$oldpid" 2>/dev/null; then
    echo "Exolus tampaknya sudah berjalan (PID $oldpid)."
    echo "Alamat: http://127.0.0.1:18765"
    echo "Log: $LOG"
    exit 0
  fi
  rm -f "$PIDFILE"
fi
nohup node "$PWD/server.js" >> "$LOG" 2>&1 < /dev/null &
pid=$!
echo "$pid" > "$PIDFILE"
sleep 1
if kill -0 "$pid" 2>/dev/null; then
  echo "Exolus dijalankan di latar belakang (PID $pid)."
  echo "Alamat: http://127.0.0.1:18765"
  echo "Log: $LOG"
  echo "Stop: bash stop-background.sh"
else
  rm -f "$PIDFILE"
  echo "Server gagal berjalan. Periksa log: $LOG"
  tail -n 30 "$LOG" 2>/dev/null || true
  exit 1
fi
