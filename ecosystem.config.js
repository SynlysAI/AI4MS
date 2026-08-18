/**
 * AI4MS 门户 — PM2 后台启动配置（Linux 服务器版）
 * 使用：pm2 start ecosystem.config.js
 *
 * 注意：本文件原先为 Windows 路径版本，已按服务器实际运行参数
 * （pm2 describe ai4ms-portal）改写为 Linux 版本。
 */

// ── 实验室公共配置注入（读取共享密钥；文件缺失时返回空对象，本地开发不受影响）──
const COMMON_ENV = (() => {
  try {
    const out = {};
    for (const line of require("fs")
      .readFileSync("/home/fangyikai/lab-common.env", "utf-8")
      .split(/\r?\n/)) {
      if (line.trim().startsWith("#")) continue;
      const idx = line.indexOf("=");
      if (idx > 0) out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    return out;
  } catch {
    return {};
  }
})();

module.exports = {
  apps: [
    {
      name: "ai4ms-portal",
      cwd: "/home/fangyikai/github_project/AI4MS/backend",
      script: "/polymer/conda/envs/ai4ms/bin/uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 8002",
      interpreter: "none",
      watch: false,
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        ...COMMON_ENV,
      },
    },
  ],
};
