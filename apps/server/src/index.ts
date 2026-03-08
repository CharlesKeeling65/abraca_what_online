import { loadEnv } from "./config/env";
import { createServerApp } from "./net/createServerApp";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await createServerApp(env);
  await app.listen();
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://${env.host}:${app.port} (ws path: /ws)`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("[server] failed to start", error);
  process.exitCode = 1;
});
