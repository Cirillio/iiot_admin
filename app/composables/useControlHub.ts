import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

const controlHub = "hubs/control";

/**
 * Канал диспетчеризации (Control Feedback). Отдельное соединение от телеметрии:
 * слушает жизненный цикл команд управления и питает commands store.
 */
export const useControlHub = () => {
  const config = useRuntimeConfig();
  const commands = useCommandsStore();
  const appLogger = useAppLoggerStore();
  const notifications = useNotificationsStore();

  const connect = async () => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      appLogger.log.info("control-hub", "Already connected");
      return;
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/${controlHub}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("CommandStatusChanged", (json: string) => {
      commands.onStatusEvent(json);
    });

    connection.onreconnecting(() => {
      appLogger.log.general("control-hub", "Reconnecting...");
      commands.isConnected = false;
    });
    connection.onreconnected(() => {
      appLogger.log.general("control-hub", "Reconnected");
      commands.isConnected = true;
    });
    connection.onclose(() => {
      appLogger.log.info("control-hub", "Connection closed");
      commands.isConnected = false;
    });

    try {
      await connection.start();
      commands.isConnected = true;
      appLogger.log.info("control-hub", "Control channel connected");
      notifications.add("Control", `Connected to ${controlHub}`, "INFO");
    } catch (e) {
      commands.isConnected = false;
      appLogger.log.error("control-hub", `Connection failed: ${e}`);
      notifications.add("Control Channel Failed", `${e}`, "CRITICAL");
    }
  };

  const disconnect = async () => {
    await connection?.stop();
    connection = null;
    commands.isConnected = false;
    appLogger.log.info("control-hub", "Control channel disconnected");
  };

  return {
    connect,
    disconnect,
    isConnected: computed(() => commands.isConnected),
  };
};
