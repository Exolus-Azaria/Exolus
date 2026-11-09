#!/data/data/com.termux/files/usr/bin/bash
set -u
cd "$(dirname "$0")" || exit 1
export PATH="/data/data/com.termux/files/usr/bin:$PATH"

echo "=== Menjalankan Exolus Auto-Start System ==="

# 1. Pastikan wake-lock aktif agar Termux tidak sleep di background
termux-wake-lock >/dev/null 2>&1 || true

# 2. Jalankan 9router jika tersedia
if command -v 9router >/dev/null 2>&1; then
  if ! pgrep -f 9router >/dev/null 2>&1; then
    echo "Menjalankan 9router..."
    nohup 9router >> "$PWD/9router.log" 2>&1 < /dev/null &
  else
    echo "9router sudah berjalan."
  fi
elif [ -f "$HOME/.9router/bin/9router" ]; then
  if ! pgrep -f 9router >/dev/null 2>&1; then
    echo "Menjalankan 9router dari home..."
    nohup "$HOME/.9router/bin/9router" >> "$PWD/9router.log" 2>&1 < /dev/null &
  fi
fi

# 3. Verifikasi Hermes Agent
if command -v hermes >/dev/null 2>&1; then
  echo "Hermes Agent terdeteksi."
  hermes status >/dev/null 2>&1 || true
fi

# 4. Jalankan Server Exolus (jika belum berjalan)
PIDFILE="$PWD/exolus-server.pid"
if [ -f "$PIDFILE" ]; then
  oldpid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "$oldpid" ] && kill -0 "$oldpid" 2>/dev/null; then
    echo "Exolus Server sudah berjalan (PID $oldpid)."
  else
    rm -f "$PIDFILE"
  fi
fi

if [ ! -f "$PIDFILE" ]; then
  echo "Menjalankan Exolus Server di port 18765..."
  nohup node "$PWD/server.js" >> "$PWD/exolus-server.log" 2>&1 < /dev/null &
  echo $! > "$PIDFILE"
  echo "Exolus Server berhasil dihidupkan."
fi

# 5. Jalankan Cloudflare Tunnel otomatis (jika belum berjalan)
if ! pgrep -f "cloudflared" >/dev/null 2>&1; then
  echo "Menjalankan Cloudflare Tunnel..."
  nohup bash "$PWD/start-tunnel.sh" >> "$HOME/cloudflared-exolus.log" 2>&1 < /dev/null &
  echo "Cloudflare Tunnel aktif di background (auto-sync ke GitHub)."
fi

# 6. Pasang Termux Boot otomatis
BOOT_DIR="$HOME/.termux/boot"
mkdir -p "$BOOT_DIR"
BOOT_SCRIPT="$BOOT_DIR/start-exolus.sh"
{
  printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash'
  printf '%s\n' 'export PATH="/data/data/com.termux/files/usr/bin:$PATH"'
  printf '%s\n' 'termux-wake-lock >/dev/null 2>&1 || true'
  printf 'cd %q || exit 1\n' "$PWD"
  printf '%s\n' 'bash ./start-all.sh'
} > "$BOOT_SCRIPT"
chmod 700 "$BOOT_SCRIPT"
echo "Termux Boot otomatis terpasang di $BOOT_SCRIPT"

echo "=== Semua sistem Exolus aktif otomatis ==="
echo "Akses lokal: http://127.0.0.1:18765"
