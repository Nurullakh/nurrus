#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/var/www/kitchen-store-root}"
ECOSYSTEM_FILE="${ECOSYSTEM_FILE:-${ROOT_DIR}/ecosystem.config.cjs}"
DEPLOY_USER="${DEPLOY_USER:-$(whoami)}"

run_as_deploy_user() {
  if [ "${DEPLOY_USER}" = "$(whoami)" ]; then
    "$@"
  else
    sudo -u "${DEPLOY_USER}" "$@"
  fi
}

pm2_cmd() {
  run_as_deploy_user pm2 "$@"
}

echo "[beget/deploy] root: ${ROOT_DIR}"

if [ ! -d "${ROOT_DIR}" ]; then
  echo "[beget/deploy] ERROR: directory not found: ${ROOT_DIR}"
  exit 1
fi

command -v npm >/dev/null 2>&1 || { echo "[beget/deploy] ERROR: npm not found"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "[beget/deploy] ERROR: pm2 not found"; exit 1; }

cd "${ROOT_DIR}"

if [ -d .git ]; then
  echo "[beget/deploy] pulling latest code"
  git pull --ff-only
fi

echo "[beget/deploy] backend: install + build"
cd "${ROOT_DIR}/kitchen-store-backend"
run_as_deploy_user npm ci
run_as_deploy_user npm run build
mkdir -p uploads/{avatars,banners,categories,reviews}

echo "[beget/deploy] storefront: install + build"
cd "${ROOT_DIR}/kitchen-store-react"
run_as_deploy_user npm ci
run_as_deploy_user npm run build

echo "[beget/deploy] admin: install + build"
cd "${ROOT_DIR}/kitchen-store-admin"
run_as_deploy_user npm ci
run_as_deploy_user npm run build

cd "${ROOT_DIR}"

if [ ! -f "${ECOSYSTEM_FILE}" ]; then
  cp deployment/beget/ecosystem.config.cjs "${ECOSYSTEM_FILE}"
fi

export ROOT_DIR
echo "[beget/deploy] restarting pm2 apps"
pm2_cmd startOrRestart "${ECOSYSTEM_FILE}"
pm2_cmd save

if command -v nginx >/dev/null 2>&1; then
  echo "[beget/deploy] reloading nginx"
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "[beget/deploy] done"
pm2_cmd status
