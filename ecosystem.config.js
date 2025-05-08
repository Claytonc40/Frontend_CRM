module.exports = {
  apps: [
    {
      name: "frontend",
      script: "serve",
      args: "-s build -p 3000",
      env: {
        NODE_ENV: "production",
        PM2_SERVE_PATH: "build",
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: "true",
        PM2_SERVE_HOMEPAGE: "/index.html",
      },
      exec_mode: "fork",
      instances: 1,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
