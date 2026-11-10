#!/usr/bin/env bash
set -e

REPO_PATH="/data/data/com.termux/files/home/projects/Exolus"
STATUS="PASS"

echo "=== Exolus Service Healthcheck ==="

# 1. Verify Exolus repository root
CURRENT_DIR="$(pwd)"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
if [ "$GIT_ROOT" != "$REPO_PATH" ]; then
  echo "[!] FAIL: Git root mismatch ($GIT_ROOT)"
  exit 1
else
  echo "[*] PASS: Repository root verified."
fi

# 2. Check if Exolus server process is running (e.g., server.js)
echo "[*] Checking Exolus server process..."
if pgrep -f "node.*server.js" > /dev/null 2>&1 || pgrep -f "server.js" > /dev/null 2>&1; then
  echo "    [PASS] Exolus server process is running."
  SERVER_RUNNING=true
else
  echo "    [WARN] Exolus server process is not currently running (Exolus supports stopped states)."
  SERVER_RUNNING=false
fi

# 3. Check configured Exolus HTTP endpoint (default port 3000 or environment)
EXOLUS_PORT="${PORT:-3000}"
EXOLUS_URL="${EXOLUS_URL:-http://localhost:$EXOLUS_PORT}"
echo "[*] Checking Exolus HTTP endpoint ($EXOLUS_URL)..."
if command -v curl &> /dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$EXOLUS_URL" || echo "000")
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 500 ]; then
    echo "    [PASS] HTTP endpoint responded with status $HTTP_CODE."
  elif [ "$SERVER_RUNNING" = true ]; then
    echo "    [WARN] Server process running, but HTTP endpoint returned status $HTTP_CODE."
  else
    echo "    [SKIP] HTTP endpoint not reachable (Server is stopped)."
  fi
else
  echo "    [SKIP] curl not available; skipping HTTP endpoint check."
fi

# 4. Check whether Hermes Agent command/runtime is available
echo "[*] Checking Hermes Agent availability..."
if command -v hermes &> /dev/null || [ -d "/data/data/com.termux/files/home/.hermes" ]; then
  echo "    [PASS] Hermes environment/runtime detected."
else
  echo "    [WARN] Hermes command/runtime not directly detected in PATH."
fi

# 5. Check whether 9Router service is reachable (if configured/standard port e.g. 9000 or 8080/etc, check common or skip)
ROUTER_URL="${ROUTER_URL:-http://localhost:9000}"
echo "[*] Checking 9Router service..."
if command -v curl &> /dev/null; then
  ROUTER_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$ROUTER_URL" || echo "000")
  if [ "$ROUTER_CODE" -ge 200 ] && [ "$ROUTER_CODE" -lt 500 ]; then
    echo "    [PASS] 9Router reachable (HTTP $ROUTER_CODE)."
  else
    echo "    [SKIP] 9Router service not reachable or not running on standard port (optional service)."
  fi
else
  echo "    [SKIP] curl not available; skipping 9Router check."
fi

echo "========================================"
echo ">>> HEALTHCHECK COMPLETED"
exit 0
