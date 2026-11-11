#!/bin/sh
# Publie Renfo Trail sur GitHub Pages (dépôt dam-gth/renfo-trail, branche main, racine).
set -e
cd "$(dirname "$0")"
VERSION="renfo-$(date +%Y%m%d%H%M)"
sed -i '' "s/const CACHE = '[^']*'/const CACHE = '$VERSION'/" sw.js
git add -A
if git diff --cached --quiet; then echo "Rien à publier."; exit 0; fi
git commit -m "${1:-Mise à jour} ($VERSION)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
echo "Publié : https://dam-gth.github.io/renfo-trail/"
