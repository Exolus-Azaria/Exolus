#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then echo "Node.js belum ditemukan. Pasang Node.js terlebih dahulu."; exit 1; fi
if ! command -v hermes >/dev/null 2>&1; then echo "Hermes CLI tidak ditemukan pada PATH Termux."; exit 1; fi
node server.js
