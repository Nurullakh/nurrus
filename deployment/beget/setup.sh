#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/var/www/kitchen-store-root}"
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

echo "[beget/setup] root: ${ROOT_DIR}"
echo "[beget/setup] deploy user: ${DEPLOY_USER}"

if [ ! -d "${ROOT_DIR}" ]; then
  echo "[beget/setup] ERROR: ${ROOT_DIR} not found. Clone repo first:"
  echo "  cd /var/www && git clone <repo> kitchen-store-root"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[beget/setup] Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "[beget/setup] Installing PM2..."
  sudo npm i -g pm2
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "[beget/setup] Installing PostgreSQL..."
  sudo apt update
  sudo apt install -y postgresql postgresql-contrib
  sudo systemctl enable postgresql
  sudo systemctl start postgresql
fi

if ! command -v nginx >/dev/null 2>&1; then
  echo "[beget/setup] Installing Nginx..."
  sudo apt install -y nginx
  sudo systemctl enable nginx
  sudo systemctl start nginx
fi

DB_NAME="${DB_NAME:-kitchen_store}"
DB_USER="${DB_USER:-kitchen_user}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)}"

echo "[beget/setup] creating database user and database (if missing)"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

ENV_DIR="${ROOT_DIR}/deployment/beget/env"
BACKEND_ENV="${ROOT_DIR}/kitchen-store-backend/.env"
STORE_ENV="${ROOT_DIR}/kitchen-store-react/.env.production"
ADMIN_ENV="${ROOT_DIR}/kitchen-store-admin/.env.production"

if [ ! -f "${BACKEND_ENV}" ]; then
  cp "${ENV_DIR}/backend.env.example" "${BACKEND_ENV}"
  sed -i "s/DB_PASSWORD=change_me/DB_PASSWORD=${DB_PASSWORD}/" "${BACKEND_ENV}"
  echo "[beget/setup] created ${BACKEND_ENV}"
fi

if [ ! -f "${STORE_ENV}" ]; then
  cp "${ENV_DIR}/storefront.env.example" "${STORE_ENV}"
  echo "[beget/setup] created ${STORE_ENV}"
fi

if [ ! -f "${ADMIN_ENV}" ]; then
  cp "${ENV_DIR}/admin.env.example" "${ADMIN_ENV}"
  echo "[beget/setup] created ${ADMIN_ENV}"
fi

mkdir -p "${ROOT_DIR}/kitchen-store-backend/uploads"/{avatars,banners,categories,reviews}

ECOSYSTEM="${ROOT_DIR}/ecosystem.config.cjs"
if [ ! -f "${ECOSYSTEM}" ]; then
  cp "${ROOT_DIR}/deployment/beget/ecosystem.config.cjs" "${ECOSYSTEM}"
  echo "[beget/setup] created ${ECOSYSTEM}"
fi

echo ""
echo "[beget/setup] DONE"
echo ""
echo "Saved DB credentials:"
echo "  DB_USER=${DB_USER}"
echo "  DB_PASSWORD=${DB_PASSWORD}"
echo "  DB_NAME=${DB_NAME}"
echo ""
echo "Next steps:"
echo "  1) Edit env files (domains, JWT_SECRET, Telegram)"
echo "  2) sudo cp deployment/beget/nginx.conf /etc/nginx/sites-available/kitchen-store.conf"
echo "  3) bash deployment/beget/deploy.sh"
echo "  4) cd kitchen-store-backend && npm run schema:sync:prod"
