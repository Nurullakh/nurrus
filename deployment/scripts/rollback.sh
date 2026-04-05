#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/var/www/kitchen-store-root}"
TARGET_COMMIT="${1:-}"

if [ ! -d "${ROOT_DIR}" ]; then
  echo "[rollback] ERROR: root directory not found: ${ROOT_DIR}"
  exit 1
fi

command -v pm2 >/dev/null 2>&1 || { echo "[rollback] ERROR: pm2 not found"; exit 1; }

cd "${ROOT_DIR}"

if [ -z "${TARGET_COMMIT}" ]; then
  TARGET_COMMIT="$(git rev-parse HEAD~1)"
fi

echo "[rollback] target commit: ${TARGET_COMMIT}"
git fetch --all
git checkout "${TARGET_COMMIT}"

echo "[rollback] rebuilding projects"
cd "${ROOT_DIR}/kitchen-store-backend" && npm ci && npm run build
cd "${ROOT_DIR}/kitchen-store-react" && npm ci && npm run build
cd "${ROOT_DIR}/kitchen-store-admin" && npm ci && npm run build

cd "${ROOT_DIR}"
pm2 startOrRestart "${ROOT_DIR}/ecosystem.config.cjs"
pm2 save

echo "[rollback] reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "[rollback] done"
