#!/usr/bin/env bash
set -euo pipefail

REPOSITORY="association-lamaloka/La-Maloka-App"
BRANCH="${1:-work}"
BASE_BRANCH="${2:-main}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Erreur: GitHub CLI (gh) n'est pas installé." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Erreur: aucune session GitHub autorisée. Exécutez 'gh auth login' dans cet environnement." >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "https://github.com/${REPOSITORY}.git"
else
  git remote add origin "https://github.com/${REPOSITORY}.git"
fi

git push --set-upstream origin "${BRANCH}"

if gh pr view "${BRANCH}" --repo "${REPOSITORY}" >/dev/null 2>&1; then
  gh pr view "${BRANCH}" --repo "${REPOSITORY}" --web
else
  gh pr create \
    --repo "${REPOSITORY}" \
    --base "${BASE_BRANCH}" \
    --head "${BRANCH}" \
    --title "feat: convertir La Maloka en una landing segura" \
    --body "Convertit le site en landing informative, ferme les anciennes collections contenant des données personnelles et remplace l'ancien back-office par un accès Firebase réservé à l'équipe."
fi
