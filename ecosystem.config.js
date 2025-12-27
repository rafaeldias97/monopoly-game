// Carregar variáveis de ambiente do arquivo .env
const path = require("path");
const fs = require("fs");

// Função para carregar variáveis do .env
function loadEnvFile(envPath) {
  const env = {};
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
          const [key, ...valueParts] = trimmedLine.split("=");
          if (key && valueParts.length > 0) {
            const value = valueParts.join("=").replace(/^["']|["']$/g, "");
            env[key.trim()] = value.trim();
          }
        }
      });
    }
  } catch (error) {
    console.error(`Erro ao carregar ${envPath}:`, error.message);
  }
  return env;
}

// Carregar .env do backend
const backendEnvPath = path.join(__dirname, "backend", ".env");
const backendEnv = loadEnvFile(backendEnvPath);

module.exports = {
  apps: [
    {
      name: "monopoly-backend",
      script: "./dist/main.js",
      cwd: "./backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        ...backendEnv,
      },
      error_file: "../logs/backend-error.log",
      out_file: "../logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
