#!/usr/bin/env bash
set -euo pipefail
if [ ! -d .git ]; then
  git init
  git add -A
  git commit -m "Release V.GAI.1.0: Sombras sobre el Nilo 1909 + Aethrion"
fi
git tag -f V.GAI.1.0 -m "Versión V.GAI.1.0 lista para entrega"
echo "Tag V.GAI.1.0 preparado."
