/**
 * AI4MS 门户 — PM2 后台启动配置
 * 使用：pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: "ai4ms-portal",
      cwd: "E:\\github_project\\AI4MS\\backend",
      script: "C:\\conda_envs\\ai4ms\\Scripts\\uvicorn.exe",
      args: "app.main:app --host 0.0.0.0 --port 8002",
      interpreter: "none",
      watch: false,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
