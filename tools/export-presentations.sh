#!/usr/bin/env bash
# Экспорт презентаций в PDF (каждый слайд — страница 1920×1080).
# Дальше PDF импортируется в Figma, из Figma — в PowerPoint или обратно в PDF.
# Требуется: локальный сервер и Google Chrome.
#   node -e "..." или: python3 -m http.server 8791   (из корня репозитория)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8791}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="$ROOT/presentations/export"
mkdir -p "$OUT"
for d in "$ROOT"/presentations/speakers/*/; do
  name="$(basename "$d")"
  [ -f "$d/index.html" ] || continue
  echo "→ $name"
  "$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=8000 \
    --print-to-pdf="$OUT/$name.pdf" --no-pdf-header-footer \
    "http://127.0.0.1:$PORT/presentations/speakers/$name/index.html" 2>/dev/null
done
echo "Готово: $OUT"
