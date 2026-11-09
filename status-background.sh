#!/data/data/com.termux/files/usr/bin/bash
cd "$(dirname "$0")" || exit 1
PIDFILE="$PWD/exolus-server.pid"
if [ -f "$PIDFILE" ]; then
  pid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    echo "Proses Exolus hidup (PID $pid)."
    PORT="${HERMES_UI_PORT:-18767}"
    if command -v curl >/dev/null 2>&1; then curl -sS --max-time 3 -o /dev/null -w 'HTTP: %{http_code}\n' "http://127.0.0.1:$PORT" || true; fi
    exit 0
  fi
fi
echo "Exolus tidak terdeteksi berjalan."
exit 1
