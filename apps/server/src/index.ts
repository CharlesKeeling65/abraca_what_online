import { loadEnv } from "./config/env";
import { WsGateway } from "./net/WsGateway";

function bootstrap(): WsGateway {
  const env = loadEnv();
  const gateway = new WsGateway();
  // eslint-disable-next-line no-console
  console.log(`[server] gateway ready on ${env.host}:${env.port}`);
  return gateway;
}

bootstrap();
