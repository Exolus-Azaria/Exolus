#!/usr/bin/env bash
set -e

REPO_PATH="/data/data/com.termux/files/home/projects/Exolus"

echo "=== Exolus Repository Audit ==="

# 1 & 2. Check working directory and git root
CURRENT_DIR="$(pwd)"
echo "[*] Current Directory: $CURRENT_DIR"

GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
echo "[*] Git Root: $GIT_ROOT"

if [ "$GIT_ROOT" != "$REPO_PATH" ]; then
  echo "[!] Error: Git root does not match Exolus repository path ($REPO_PATH)."
  exit 1
fi

# 3. Active branch
BRANCH="$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD)"
echo "[*] Active Branch: $BRANCH"

# 7. AGENTS.md check
if [ -f "$REPO_PATH/AGENTS.md" ]; then
  echo "[*] AGENTS.md: Present"
else
  echo "[!] AGENTS.md: Missing!"
fi

# 6. Last commit
echo "[*] Last Commit:"
git log -1 --oneline

# 4. Git status
echo "[*] Git Status:"
git status --short

# 5. Tracked and untracked changes count
TRACKED_CHANGES=$(git diff --name-only | wc -l)
UNTRACKED_CHANGES=$(git ls-files --others --exclude-standard | wc -l)
echo "[*] Tracked changes count: $TRACKED_CHANGES"
echo "[*] Untracked files count: $UNTRACKED_CHANGES"

echo "=== Audit Complete ==="
