export interface PlayGuide {
  isMockMode: boolean;
  connectionTip: string;
  steps: string[];
}

export function buildPlayGuide(connectionUrl: string, roomId: string): PlayGuide {
  const isMockMode = connectionUrl.startsWith("mock://");
  if (isMockMode) {
    return {
      isMockMode,
      connectionTip:
        "当前是 mock://local，本模式只在当前页面内模拟，不会让多个页面共享同一个房间。想体验 2 人或更多玩家，请先启动服务端，再改成真实 ws 地址。",
      steps: [
        "先点击“连接”，确认当前页面可操作。",
        "如果只想单页看界面，保留 mock://local 即可。",
        `如果要多人试玩，请先运行服务端，再把连接地址改成 ws://127.0.0.1:8080/ws，房间号可用 ${roomId || "room-demo"}。`,
      ],
    };
  }

  return {
    isMockMode,
    connectionTip:
      "当前是实时 WebSocket 模式。要体验多人联机，请打开 2 个或更多浏览器窗口，连接同一个 ws 地址并加入同一个房间。",
    steps: [
      "第 1 个窗口：点击“连接”，创建房间。",
      "第 2 个及更多窗口：点击“连接”后，输入相同房间号，再点击“加入房间”。",
      "除房主外的玩家点击“准备 / 取消准备”，房主看到全部就绪后点击“开始游戏”。",
      "每个窗口分别代表一名玩家，轮到谁就在哪个窗口里宣言施法或结束回合。",
    ],
  };
}
