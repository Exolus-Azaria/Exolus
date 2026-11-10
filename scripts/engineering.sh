#!/usr/bin/env bash
set -e

REPO_PATH="/data/data/com.termux/files/home/projects/Exolus"
cd "$REPO_PATH"

print_banner() {
  echo "========================================"
  echo "    EXOLUS ENGINEERING TOOLKIT v1.0    "
  echo "========================================"
}

print_help() {
  print_banner
  echo "Usage: ./scripts/engineering.sh <command>"
  echo ""
  echo "Commands:"
  echo "  audit      Run repository integrity audit"
  echo "  verify     Run engineering verification & syntax checks"
  echo "  health     Run local service healthcheck"
  echo "  doctor     Run diagnostic checks & environment audit"
  echo "  test       Run unified test runner (audit + verify + health)"
  echo "  help       Display this help message"
  echo ""
}

CMD="${1:-help}"

case "$CMD" in
  audit)
    print_banner
    exec ./scripts/audit.sh
    ;;
  verify)
    print_banner
    exec ./scripts/verify.sh
    ;;
  health)
    print_banner
    exec ./scripts/healthcheck.sh
    ;;
  doctor)
    print_banner
    exec ./scripts/doctor.sh
    ;;
  test)
    print_banner
    exec ./scripts/test.sh
    ;;
  help|--help|-h)
    print_help
    exit 0
    ;;
  *)
    echo "[!] Error: Unknown command '$CMD'."
    echo ""
    print_help
    exit 1
    ;;
esac
