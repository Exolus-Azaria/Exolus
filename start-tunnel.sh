#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
PORT="${HERMES_UI_PORT:-18767}"
TOKEN_FILE="$HOME/.config/exolus/.hermes-ui-token"
if [ ! -f "$TOKEN_FILE" ] && [ -f .hermes-ui-token ]; then
  TOKEN_FILE="$PWD/.hermes-ui-token"
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared belum terpasang. Pasang cloudflared dari sumber resmi yang sesuai untuk Termux terlebih dahulu."
  echo "Jangan gunakan tunnel tidak dikenal atau bagikan token UI."
  exit 1
fi
if [ ! -f "$TOKEN_FILE" ]; then
  echo "Token UI belum dibuat di $TOKEN_FILE."
  echo "Jalankan bash start.sh sekali untuk menghasilkan token, lalu coba lagi."
  exit 1
fi
TOKEN_LEN=$(wc -c < "$TOKEN_FILE" | tr -d ' ')
if [ "$TOKEN_LEN" -lt 8 ]; then
  echo "Token UI terlalu pendek untuk akses publik ($TOKEN_LEN karakter)."
  echo "Hentikan server, buat token acak panjang, lalu coba lagi."
  exit 1
fi
echo "Memulai Cloudflare Quick Tunnel HTTPS ke http://127.0.0.1:$PORT."
echo "Alamat HTTPS sementara akan muncul di bawah. Jangan bagikan token UI."
exec cloudflared tunnel --url "http://127.0.0.1:$PORT"
