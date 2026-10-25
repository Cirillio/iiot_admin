import * as signalR from "@microsoft/signalr";
import type { AlertLevel } from "~/types/api";

let connection: signalR.HubConnection | null = null;
let connectingPromise: Promise<void> | null = null;

const metricsHub = "hubs/metrics";

export const useSignalR = () => {
  const config = useRuntimeConfig();
  const store = useRealTimeStore();
  const appLogger = useAppLoggerStore();
  const notifications = useNotificationsStore();

  // По умолчанию autoconnect включён для операторского АРМ.
  const autoconnect = useLocalStorage("iiot-signalr-autoconnect", true);

  const toggleAutoconnect = (value?: boolean) => {
    autoconnect.value = value ?? !autoconnect.value;
  };

  const connect = async () => {
    // Предотвращаем гонки и повторное создание соединения
    if (connectingPromise) {
      return connectingPromise;
    }

    if (
      connection &&
      (connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Connecting ||
        connection.state === signalR.HubConnectionState.Reconnecting)
    ) {
      appLogger.log.info("signalr-connection", `Already in state: ${connection.state}`);
      return;
    }

    const hubUrl = buildApiUrl(config.public.apiBase, metricsHub);

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveMetrics", (json: string) => {
      store.onMetric(json);
    });

    connection.on("ConfigUpdated", (entityType: string, entityId: number) => {
      appLogger.log.info(
        "signalr-config",
        `Config Updated: ${entityType} ID:${entityId}`,
      );
      if (entityType === "DEVICE") {
        refreshNuxtData(["devices", `device-${entityId}`]);
      } else if (entityType === "TAG") {
        refreshNuxtData("tags");
        useAlertsStore().refresh();
      } else if (entityType === "CONNECTION") {
        refreshNuxtData("connections");
      }
    });

    connection.on("SystemAlert", (message: string, level: string) => {
      appLogger.log.warning(
        "signalr-alert",
        `System Alert (${level}): ${message}`,
      );
      useNotificationsStore().add("System Alert", message, level as AlertLevel);
    });

    connection.onreconnecting((error) => {
      store.isConnected = false;
      appLogger.log.warning("signalr-reconnecting", `Reconnecting: ${error?.message || "network blip"}`);
      notifications.add("Metrics", "Reconnecting to live telemetry…", "WARNING");
    });

    connection.onreconnected(() => {
      store.isConnected = true;
      appLogger.log.info("signalr-reconnected", "SignalR reconnected");
      notifications.add("Metrics", "Reconnected", "SUCCESS");
    });

    connection.onclose((error) => {
      store.isConnected = false;
      if (error) {
        appLogger.log.error("signalr-close-err", `Connection closed with error: ${error.message}`);
      } else {
        appLogger.log.info("signalr-close", "Connection closed cleanly");
      }
    });

    connectingPromise = (async () => {
      try {
        await connection!.start();
        store.isConnected = true;
        notifications.add("Metrics", "Channel connected", "SUCCESS");
      } catch (e) {
        store.isConnected = false;
        appLogger.log.error("signalr-error", `Connection failed: ${e}`);
        notifications.add(
          "Connection Failed",
          `SignalR metrics channel: ${e}`,
          "CRITICAL",
        );
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
      store.isConnected = false;
      appLogger.log.info("signalr-status", "SignalR disconnected by operator");
      notifications.add("SignalR", "Disconnected by operator", "INFO");
    } catch (e) {
      appLogger.log.warning("signalr-disconnect-err", `Error during disconnect: ${e}`);
    }
  };

  return {
    autoconnect,
    toggleAutoconnect,
    connect,
    disconnect,
    isConnected: computed(() => store.isConnected),
  };
};
