#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="${ROOT}/release/SEAFOODS_PREMIUM_VERCEL_INSTALL.zip"

cd "$ROOT"
rm -f "$OUTPUT"
zip -qr "$OUTPUT" . \
  -x './.git/*' './.manus/*' './.manus-logs/*' './node_modules/*' './*/node_modules/*' './dist/*' './release/*.zip' \
     './*.log' './server/**/*.log' './client/**/*.log' './**/.env' './**/.env.*' \
     './.vercel/*'

if unzip -l "$OUTPUT" | grep -E '(^|/)(\.env|node_modules/|dist/|\.git/)' >/dev/null; then
  echo "Pacote contém caminho proibido" >&2
  exit 1
fi

echo "Pacote criado: $OUTPUT"
unzip -t "$OUTPUT" >/dev/null
echo "Integridade ZIP: OK"
