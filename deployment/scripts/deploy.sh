#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/var/www/kitchen-store-root}"
ECOSYSTEM_FILE="${ECOSYSTEM_FILE:-${ROOT_DIR}/ecosystem.config.cjs}"

echo "[deploy] root: ${ROOT_DIR}"

if [ ! -d "${ROOT_DIR}" ]; then
  echo "[deploy] ERROR: root directory not found: ${ROOT_DIR}"
  exit 1
fi

command -v npm >/dev/null 2>&1 || { echo "[deploy] ERROR: npm not found"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "[deploy] ERROR: pm2 not found"; exit 1; }

cd "${ROOT_DIR}"

echo "[deploy] pulling latest code"
git pull --ff-only

echo "[deploy] backend: install + build"
cd "${ROOT_DIR}/kitchen-store-backend"
npm ci
npm run build

echo "[deploy] storefront: install + build"
cd "${ROOT_DIR}/kitchen-store-react"
npm ci
npm run build

echo "[deploy] admin: install + build"
cd "${ROOT_DIR}/kitchen-store-admin"
npm ci
npm run build

cd "${ROOT_DIR}"

if [ ! -f "${ECOSYSTEM_FILE}" ]; then
  echo "[deploy] ecosystem config not found at ${ECOSYSTEM_FILE}, copying default"
  cp deployment/ecosystem.config.cjs "${ECOSYSTEM_FILE}"
fi

echo "[deploy] restarting pm2 apps"
pm2 startOrRestart "${ECOSYSTEM_FILE}"
pm2 save

echo "[deploy] reloading nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "[deploy] done"
