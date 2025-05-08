module.exports = {
  apps: [
    {
      name: "backend",
      script: "serve",
      args: "-s build",
      exec_mode: "cluster",
      instances: "1",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
