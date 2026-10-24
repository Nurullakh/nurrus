# Kitchen Store Production Deploy

For **Beget VPS** use: [`deployment/beget/README.ru.md`](./beget/README.ru.md)

This folder contains ready-to-use deployment assets for:

- `kitchen-store-backend` (NestJS, PM2)
- `kitchen-store-react` (Next.js, PM2)
- `kitchen-store-admin` (Vite static build served by Nginx)

## 1) Prepare server

Install required software (Ubuntu example):

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2) Clone project

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <YOUR_REPO_URL> kitchen-store-root
cd kitchen-store-root
```

## 3) Configure env files

Copy and edit:

- `kitchen-store-backend/.env.production.example` -> `kitchen-store-backend/.env`
- `kitchen-store-react/.env.production.example` -> `kitchen-store-react/.env.production`
- `kitchen-store-admin/.env.production.example` -> `kitchen-store-admin/.env.production`

## 4) Configure PM2

Copy ecosystem file to project root:

```bash
cp deployment/ecosystem.config.cjs ecosystem.config.cjs
```

## 5) Configure Nginx

Choose one:

- multi-domain: `deployment/nginx/multi-domain.conf`
- single-domain: `deployment/nginx/single-domain.conf`

Then:

```bash
sudo cp deployment/nginx/multi-domain.conf /etc/nginx/sites-available/kitchen-store.conf
sudo ln -sf /etc/nginx/sites-available/kitchen-store.conf /etc/nginx/sites-enabled/kitchen-store.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 6) First deploy

Run from repo root:

```bash
bash deployment/scripts/deploy.sh
```

## 7) Enable PM2 autostart

```bash
pm2 save
pm2 startup
```

## 8) SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d site.com -d www.site.com -d api.site.com -d admin.site.com
```

For single-domain mode, use only your main domain.

## 9) Rollback

Rollback to previous commit:

```bash
bash deployment/scripts/rollback.sh
```

Rollback to explicit commit:

```bash
bash deployment/scripts/rollback.sh <commit_sha>
```
