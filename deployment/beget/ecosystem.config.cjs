const ROOT_DIR = process.env.ROOT_DIR || "/var/www/kitchen-store-root";

module.exports = {
  apps: [
    {
      name: "ks-backend",
      cwd: `${ROOT_DIR}/kitchen-store-backend`,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
    {
      name: "ks-storefront",
      cwd: `${ROOT_DIR}/kitchen-store-react`,
      script: "npm",
      args: "run start -- -p 5173",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "768M",
      env: {
        NODE_ENV: "production",
        PORT: "5173",
      },
    },
  ],
};
