#!/usr/bin/env bash
# Unified test runner for Exolus Engineering Toolkit v1.0
VERBOSE=false
if [ "$1" = "--verbose" ] || [ "$1" = "-v" ]; then
  VERBOSE=true
fi

REPO_PATH="/data/data/com.termux/files/home/projects/Exolus"
cd "$REPO_PATH"

echo "=== Exolus Unified Test Runner ==="
FAILED_MANDATORY=0
WARNINGS=0

# 1. Run audit.sh
echo ""
echo "[1/3] Executing audit.sh..."
if ./scripts/audit.sh; then
  echo "-> Audit: PASS"
else
  echo "-> Audit: FAIL"
  FAILED_MANDATORY=$((FAILED_MANDATORY + 1))
fi

# 2. Run verify.sh
echo ""
echo "[2/3] Executing verify.sh..."
if ./scripts/verify.sh; then
  echo "-> Verify: PASS"
else
  echo "-> Verify: FAIL"
  FAILED_MANDATORY=$((FAILED_MANDATORY + 1))
fi

# 3. Run healthcheck.sh
echo ""
echo "[3/3] Executing healthcheck.sh..."
if ./scripts/healthcheck.sh; then
  echo "-> Healthcheck: COMPLETED"
else
  echo "-> Healthcheck: WARN/ISSUES"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "========================================"
echo "=== UNIFIED TEST SUMMARY ==="
echo "Mandatory Verification Failures: $FAILED_MANDATORY"
echo "Service / Optional Warnings: $WARNINGS"

if [ "$FAILED_MANDATORY" -eq 0 ]; then
  echo ">>> TEST RESULT: PASS"
  exit 0
else
  echo ">>> TEST RESULT: FAIL"
  exit 1
fi
