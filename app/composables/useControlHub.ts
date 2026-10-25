import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;
let connectingPromise: Promise<void> | null = null;

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
    if (connectingPromise) {
      return connectingPromise;
    }

    if (
      connection &&
      (connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Connecting ||
        connection.state === signalR.HubConnectionState.Reconnecting)
    ) {
      appLogger.log.info("control-hub", `Already in state: ${connection.state}`);
      return;
    }

    const hubUrl = buildApiUrl(config.public.apiBase, controlHub);

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("CommandStatusChanged", (json: string) => {
      commands.onStatusEvent(json);
    });

    connection.onreconnecting((error) => {
      commands.isConnected = false;
      appLogger.log.warning("control-reconnecting", `Reconnecting: ${error?.message || "network blip"}`);
      notifications.add("Control", "Reconnecting to control channel…", "WARNING");
    });

    connection.onreconnected(() => {
      commands.isConnected = true;
      appLogger.log.info("control-reconnected", "Control channel reconnected");
      notifications.add("Control", "Reconnected", "SUCCESS");
    });

    connection.onclose((error) => {
      commands.isConnected = false;
      if (error) {
        appLogger.log.error("control-close-err", `Connection closed with error: ${error.message}`);
      } else {
        appLogger.log.info("control-close", "Control channel closed cleanly");
      }
    });

    connectingPromise = (async () => {
      try {
        await connection!.start();
        commands.isConnected = true;
        notifications.add("Control", "Channel connected", "SUCCESS");
      } catch (e) {
        commands.isConnected = false;
        appLogger.log.error("control-hub", `Connection failed: ${e}`);
        notifications.add("Control Channel Failed", `${e}`, "CRITICAL");
      } finally {
        connectingPromise = null;
      }
    })();

    return connectingPromise;
  };

  const disconnect = async () => {
    if (!connection) return;
    try {
      const conn = connection;
      connection = null;
      await conn.stop();
      commands.isConnected = false;
      appLogger.log.info("control-hub", "Control channel disconnected by operator");
      notifications.add("Control", "Disconnected by operator", "INFO");
    } catch (e) {
      appLogger.log.warning("control-disconnect-err", `Error during disconnect: ${e}`);
    }
  };

  return {
    connect,
    disconnect,
    isConnected: computed(() => commands.isConnected),
  };
};
