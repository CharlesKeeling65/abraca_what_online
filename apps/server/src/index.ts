import { loadEnv } from "./config/env";

function bootstrap(): void {
  const env = loadEnv();
  // TODO: 接入 ws/http 框架（如 ws + fastify / uWebSockets.js）。
  // 当前阶段只保留入口骨架。
  // eslint-disable-next-line no-console
  console.log(`[server] Abraca What Online server skeleton @ ${env.host}:${env.port}`);
}

bootstrap();
