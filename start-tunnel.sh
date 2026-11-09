#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
PORT="${HERMES_UI_PORT:-18767}"
TOKEN_FILE="$HOME/.config/exolus/.hermes-ui-token"
if [ ! -f "$TOKEN_FILE" ] && [ -f .hermes-ui-token ]; then
  TOKEN_FILE="$PWD/.hermes-ui-token"
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared belum terpasang."
  exit 1
fi

echo "Memulai Cloudflare Quick Tunnel HTTPS ke http://127.0.0.1:$PORT..."

rm -f cloudflared.log
nohup cloudflared tunnel --url "http://127.0.0.1:$PORT" > cloudflared.log 2>&1 &
CPID=$!

echo "Menunggu URL tunnel dihasilkan..."
TUNNEL_URL=""
for i in {1..20}; do
  if [ -f cloudflared.log ]; then
    TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' cloudflared.log | tail -n 1 || true)
    if [ -n "$TUNNEL_URL" ]; then
      break
    fi
  fi
  sleep 1
done

if [ -n "$TUNNEL_URL" ]; then
  echo "Tunnel aktif di: $TUNNEL_URL"
  cat << EOF > backend-url.json
{
  "url": "$TUNNEL_URL",
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
  git add backend-url.json
  git commit -m "auto: update cloudflare tunnel url to $TUNNEL_URL" || true
  git push origin main || true
  echo "URL Tunnel otomatis tersinkron ke GitHub!"
else
  echo "Gagal mendeteksi URL tunnel."
fi

while kill -0 $CPID 2>/dev/null; do
  sleep 60
  NEW_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' cloudflared.log | tail -n 1 || true)
  if [ -n "$NEW_URL" ] && [ "$NEW_URL" != "$TUNNEL_URL" ]; then
    TUNNEL_URL="$NEW_URL"
    echo "Tunnel URL berubah menjadi: $TUNNEL_URL"
    cat << EOF > backend-url.json
{
  "url": "$TUNNEL_URL",
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    git add backend-url.json
    git commit -m "auto: update cloudflare tunnel url to $TUNNEL_URL" || true
    git push origin main || true
  fi
done
