export type AppRoute = "connect" | "lobby" | "game";

export interface RouteContext {
  current: AppRoute;
  connectionStatus: "idle" | "connecting" | "connected" | "error";
  roomId: string;
  roundPhase: "waiting" | "in_round" | "scoring" | "finished" | null;
}

export function resolveRoute(context: RouteContext): AppRoute {
  if (context.connectionStatus !== "connected") {
    return "connect";
  }

  if (!context.roomId) {
    return "lobby";
  }

  if (context.roundPhase && context.roundPhase !== "waiting") {
    return "game";
  }

  return "lobby";
}
