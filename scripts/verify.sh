#!/usr/bin/env bash
set -e

REPO_PATH="/data/data/com.termux/files/home/projects/Exolus"
OVERALL_STATUS="PASS"

echo "=== Exolus Engineering Verification ==="

# 1. Repository validation
CURRENT_DIR="$(pwd)"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"

if [ "$GIT_ROOT" != "$REPO_PATH" ]; then
  echo "[!] FAIL: Git root ($GIT_ROOT) does not match expected repository ($REPO_PATH)"
  exit 1
else
  echo "[*] PASS: Repository root verified."
fi

# 2. Git diff --check
echo "[*] Running git diff --check..."
if git diff --check; then
  echo "[*] PASS: git diff --check passed."
else
  echo "[!] FAIL: git diff --check detected whitespace errors."
  OVERALL_STATUS="FAIL"
fi

# 3. Detect modified, staged, and untracked files
echo "[*] Detecting file changes..."
MODIFIED_FILES=$(git diff --name-only)
STAGED_FILES=$(git diff --cached --name-only)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard)

echo "--- Modified (Unstaged) Files ---"
if [ -n "$MODIFIED_FILES" ]; then
  echo "$MODIFIED_FILES"
else
  echo "(None)"
fi

echo "--- Staged Files ---"
if [ -n "$STAGED_FILES" ]; then
  echo "$STAGED_FILES"
else
  echo "(None)"
fi

echo "--- Untracked Files ---"
if [ -n "$UNTRACKED_FILES" ]; then
  echo "$UNTRACKED_FILES"
else
  echo "(None)"
fi

# 4. Syntax Checks
echo "[*] Running Syntax Checks..."

# JavaScript syntax check using node --check
if command -v node &> /dev/null; then
  echo "[*] Node.js is available. Checking JavaScript files..."
  JS_FILES=$(git ls-files "*.js" 2>/dev/null || find . -name "*.js" -not -path "./.git/*")
  if [ -n "$JS_FILES" ]; then
    for js in $JS_FILES; do
      if [ -f "$js" ]; then
        if node --check "$js" > /dev/null 2>&1; then
          echo "    [PASS] node --check $js"
        else
          echo "    [FAIL] node --check $js syntax error"
          OVERALL_STATUS="FAIL"
        fi
      fi
    done
  else
    echo "    [SKIP] No JavaScript files found to check."
  fi
else
  echo "    [SKIP] Node.js not available; skipping JavaScript syntax check."
fi

# Bash syntax check using bash -n for .sh files
if command -v bash &> /dev/null; then
  echo "[*] Checking Bash script syntax (.sh)..."
  SH_FILES=$(find . -name "*.sh" -not -path "./.git/*")
  if [ -n "$SH_FILES" ]; then
    for sh in $SH_FILES; do
      if [ -f "$sh" ]; then
        if bash -n "$sh"; then
          echo "    [PASS] bash -n $sh"
        else
          echo "    [FAIL] bash -n $sh syntax error"
          OVERALL_STATUS="FAIL"
        fi
      fi
    done
  else
    echo "    [SKIP] No Bash files found to check."
  fi
else
  echo "    [SKIP] Bash not available; skipping shell check."
fi

echo "========================================"
if [ "$OVERALL_STATUS" = "PASS" ]; then
  echo ">>> VERIFICATION RESULT: PASS"
  echo "Note: Syntax and structure checks passed successfully. This does not guarantee full application runtime execution without integration testing."
  exit 0
else
  echo ">>> VERIFICATION RESULT: FAIL"
  exit 1
fi
