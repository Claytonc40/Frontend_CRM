module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npm",
      args: "start",
      exec_mode: "cluster",
      instances: "1",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
