#!/data/data/com.termux/files/usr/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${DIR/#\/storage\/emulated\/0/$HOME\/storage\/shared}"
if ! command -v node >/dev/null 2>&1; then echo "Node.js belum ditemukan. Pasang Node.js terlebih dahulu."; exit 1; fi
if ! command -v hermes >/dev/null 2>&1; then echo "Hermes CLI tidak ditemukan pada PATH Termux."; exit 1; fi
exec node --preserve-symlinks-main "$TARGET_DIR/server.js"
