# Деплой Kitchen Store на Beget VPS

Стек: NestJS (API) + Next.js (магазин) + Vite (админка) + PostgreSQL + Nginx + PM2.

## Что нужно на Beget

1. VPS с Ubuntu (лучше образ **Node.js** из маркетплейса Beget — уже есть Node, PM2, Nginx).
2. Домен (свой или бесплатный `*.beget.app` — SSL выдаётся автоматически).
3. Минимум **2 GB RAM** (Next.js + NestJS + PostgreSQL).

## Домены (рекомендуется)

| Поддомен | Сервис |
|----------|--------|
| `site.ru` | магазин (Next.js, порт 5173) |
| `api.site.ru` | бэкенд (NestJS, порт 3001) |
| `admin.site.ru` | админка (статика из `dist/`) |

A-записи всех поддоменов → IP VPS.

---

## Быстрый старт

### 1. Подключись по SSH

```bash
ssh root@YOUR_VPS_IP
# или ssh nodejs@YOUR_VPS_IP  (если образ Node.js от Beget)
```

### 2. Первичная настройка сервера

```bash
cd /var/www
git clone <URL_ТВОЕГО_РЕПО> kitchen-store-root
cd kitchen-store-root
bash deployment/beget/setup.sh
```

Скрипт установит PostgreSQL, создаст БД, скопирует env-шаблоны.

### 3. Заполни env-файлы

```bash
nano kitchen-store-backend/.env
nano kitchen-store-react/.env.production
nano kitchen-store-admin/.env.production
```

Примеры лежат в `deployment/beget/env/`.

**Обязательно замени:**
- `site.ru` → твой домен
- пароли БД и `JWT_SECRET`
- `CORS_ORIGIN` — домены магазина и админки

### 4. Nginx

```bash
sudo cp deployment/beget/nginx.conf /etc/nginx/sites-available/kitchen-store.conf
sudo ln -sf /etc/nginx/sites-available/kitchen-store.conf /etc/nginx/sites-enabled/kitchen-store.conf

# отключи дефолтный конфиг Beget, если мешает
sudo rm -f /etc/nginx/sites-enabled/nodejs.conf

sudo nginx -t
sudo systemctl reload nginx
```

Отредактируй домены в конфиге:

```bash
sudo nano /etc/nginx/sites-available/kitchen-store.conf
```

### 5. Первый деплой

```bash
bash deployment/beget/deploy.sh
```

### 6. Схема БД (только первый раз)

```bash
cd kitchen-store-backend
npm run schema:sync:prod
```

### 7. PM2 автозапуск

```bash
pm2 save
pm2 startup
# выполни команду, которую выведет pm2 startup
```

---

## Обновление после git push

```bash
cd /var/www/kitchen-store-root
bash deployment/beget/deploy.sh
```

---

## Структура файлов

```
deployment/beget/
  setup.sh          — первичная настройка VPS
  deploy.sh         — сборка + перезапуск PM2 + reload nginx
  nginx.conf        — конфиг для 3 поддоменов
  nginx-single.conf — один домен (/api, /admin)
  ecosystem.config.cjs
  env/              — примеры переменных окружения
```

---

## Частые проблемы

**502 Bad Gateway** — PM2 не запущен:
```bash
pm2 status
pm2 logs ks-backend
pm2 logs ks-storefront
```

**CORS ошибки** — проверь `CORS_ORIGIN` в backend `.env`.

**Картинки не грузятся** — папка `kitchen-store-backend/uploads` должна существовать и не удаляться при деплое.

**Мало RAM** — добавь swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Один домен вместо трёх

Используй `deployment/beget/nginx-single.conf` и env из `deployment/beget/env/single-domain/`.

В админке при сборке:
```bash
VITE_BASE_PATH=/admin/ VITE_API_URL=https://site.ru/api npm run build
```

В магазине:
```
NEXT_PUBLIC_API_URL=https://site.ru/api
```
