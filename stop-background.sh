#!/data/data/com.termux/files/usr/bin/bash
set -u
cd "$(dirname "$0")" || exit 1
PIDFILE="$PWD/exolus-server.pid"
if [ ! -f "$PIDFILE" ]; then echo "PID file tidak ditemukan; Exolus mungkin tidak berjalan lewat start-background.sh."; exit 0; fi
pid="$(cat "$PIDFILE" 2>/dev/null || true)"
if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
  kill "$pid" 2>/dev/null || true
  sleep 1
  if kill -0 "$pid" 2>/dev/null; then kill -TERM "$pid" 2>/dev/null || true; fi
  echo "Sinyal berhenti dikirim ke proses Exolus (PID $pid)."
else
  echo "Proses Exolus sudah tidak berjalan."
fi
rm -f "$PIDFILE"
