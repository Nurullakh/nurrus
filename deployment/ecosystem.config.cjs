module.exports = {
  apps: [
    {
      name: "ks-backend",
      cwd: `${process.env.ROOT_DIR || "/var/www/kitchen-store-root"}/kitchen-store-backend`,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
    {
      name: "ks-storefront",
      cwd: `${process.env.ROOT_DIR || "/var/www/kitchen-store-root"}/kitchen-store-react`,
      script: "npm",
      args: "run start -- -p 5173",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
