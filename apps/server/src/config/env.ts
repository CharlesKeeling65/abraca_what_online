export interface ServerEnv {
  port: number;
  host: string;
}

export function loadEnv(): ServerEnv {
  return {
    port: Number(process.env.PORT ?? 8080),
    host: process.env.HOST ?? "0.0.0.0",
  };
}
