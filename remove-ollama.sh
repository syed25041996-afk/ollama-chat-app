#!/usr/bin/env bash

set -e

echo "🛑 Stopping Ollama if running..."
pkill ollama || true

echo "🗑 Removing Ollama binaries..."
if command -v ollama >/dev/null 2>&1; then
  OLLAMA_PATH=$(which ollama)
  sudo rm -f "$OLLAMA_PATH"
  echo "Removed binary at $OLLAMA_PATH"
else
  echo "Ollama binary not found"
fi

echo "🧹 Removing Ollama data directory..."
rm -rf ~/.ollama

echo "🧹 Removing Ollama cache and config..."
rm -rf ~/.cache/ollama
rm -rf ~/.config/ollama

echo "🛑 Removing Ollama systemd user service..."
systemctl --user stop ollama 2>/dev/null || true
systemctl --user disable ollama 2>/dev/null || true
rm -f ~/.config/systemd/user/ollama.service
systemctl --user daemon-reload 2>/dev/null || true

echo "🧽 Cleaning OLLAMA_* environment variables from shell configs..."

SHELL_FILES=(
  "$HOME/.bashrc"
  "$HOME/.profile"
  "$HOME/.zshrc"
)

for file in "${SHELL_FILES[@]}"; do
  if [ -f "$file" ]; then
    sed -i '/OLLAMA_/d' "$file"
    echo "Cleaned $file"
  fi
done

echo "🔍 Verifying removal..."
if command -v ollama >/dev/null 2>&1; then
  echo "❌ Ollama still found in PATH"
else
  echo "✅ Ollama binary removed"
fi

if [ -d "$HOME/.ollama" ]; then
  echo "❌ ~/.ollama still exists"
else
  echo "✅ ~/.ollama removed"
fi

echo "🧠 Reloading shell environment..."
source ~/.bashrc 2>/dev/null || true

echo "🎉 Ollama removal complete!"
echo "👉 Recommended: reboot your system for a fully clean state."
