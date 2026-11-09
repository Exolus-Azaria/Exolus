#!/data/data/com.termux/files/usr/bin/bash
set -eu
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BOOT_DIR="$HOME/.termux/boot"
mkdir -p "$BOOT_DIR"
BOOT_SCRIPT="$BOOT_DIR/start-exolus.sh"
{
  printf '%s\n' '#!/data/data/com.termux/files/usr/bin/bash'
  printf '%s\n' 'export PATH="/data/data/com.termux/files/usr/bin:$PATH"'
  printf '%s\n' 'termux-wake-lock >/dev/null 2>&1 || true'
  printf 'cd %q || exit 1\n' "$APP_DIR"
  printf '%s\n' 'bash ./start-background.sh'
} > "$BOOT_SCRIPT"
chmod 700 "$BOOT_SCRIPT"
echo "Skrip boot terpasang: $BOOT_SCRIPT"
echo "Pastikan Termux:Boot dipasang dari sumber yang sama dengan Termux dan sudah pernah dibuka sekali."
echo "Setelah itu, restart HP untuk menguji auto-start."
