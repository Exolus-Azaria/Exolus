#!/usr/bin/env bash
set -e

REPO_PATH="/data/data/com.termux/files/home/projects/Exolus"
cd "$REPO_PATH"

echo "=== Exolus Engineering Doctor ==="

ISSUES_FOUND=0

# 1. Repository root and Git availability
echo "[*] Checking Git and Repository Root..."
if command -v git &> /dev/null; then
  GIT_TOPLEVEL="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
  if [ "$GIT_TOPLEVEL" = "$REPO_PATH" ]; then
    echo "    [PASS] Git root matches $REPO_PATH"
  else
    echo "    [WARN] Git root ($GIT_TOPLEVEL) differs from expected ($REPO_PATH)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
else
  echo "    [FAIL] Git command not available."
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 2. Required project files
echo "[*] Checking Required Project Files..."
REQUIRED_FILES=("server.js" "index.html" "_config.yml" "AGENTS.md")
for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "    [PASS] $f exists"
  else
    echo "    [FAIL] Required file missing: $f"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

# 3. Script executable permissions
echo "[*] Checking Script Executable Permissions..."
for s in scripts/*.sh start.sh start-background.sh stop-background.sh status-background.sh start-tunnel.sh install-boot.sh start-all.sh; do
  if [ -f "$s" ]; then
    if [ -x "$s" ]; then
      echo "    [PASS] $s is executable"
    else
      echo "    [WARN] $s is not executable (Suggestion: chmod +x $s)"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  fi
done

# 4. Node.js availability and version
echo "[*] Checking Node.js Environment..."
if command -v node &> /dev/null; then
  NODE_VER="$(node -v)"
  echo "    [PASS] Node.js available ($NODE_VER)"
else
  echo "    [WARN] Node.js not found in PATH"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 5. Bash availability and version
echo "[*] Checking Bash Environment..."
if command -v bash &> /dev/null; then
  BASH_VER="$(bash --version | head -n 1)"
  echo "    [PASS] Bash available ($BASH_VER)"
else
  echo "    [FAIL] Bash not available"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 6. Basic storage availability
echo "[*] Checking Scratch / Storage Availability..."
if [ -n "$TMPDIR" ] && [ -d "$TMPDIR" ]; then
  echo "    [PASS] Scratch directory available: $TMPDIR"
elif [ -d "/data/data/com.termux/files/home/.hermes/cache/scratch" ]; then
  echo "    [PASS] Hermes scratch cache available."
else
  echo "    [WARN] Standard scratch directory location unverified."
fi

# 7. Verification scripts existence
echo "[*] Checking Engineering Toolkit Scripts..."
for script in scripts/audit.sh scripts/verify.sh scripts/healthcheck.sh scripts/test.sh scripts/doctor.sh scripts/engineering.sh; do
  if [ -f "$script" ]; then
    echo "    [PASS] $script present"
  else
    echo "    [WARN] Toolkit script missing: $script"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

echo "========================================"
if [ "$ISSUES_FOUND" -eq 0 ]; then
  echo ">>> DOCTOR REPORT: ALL CHECKS PASSED (0 issues)"
  exit 0
else
  echo ">>> DOCTOR REPORT: Found $ISSUES_FOUND potential issue(s)/warning(s)."
  echo "Actionable suggestions:"
  echo " - Ensure all shell scripts have executable permissions (chmod +x scripts/*.sh)."
  echo " - Verify Node.js and Bash are installed and accessible in Termux PATH."
  exit 0
fi
