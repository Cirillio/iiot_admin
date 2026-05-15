import * as signalR from "@microsoft/signalr";
import type { AlertLevel } from "~/types/api";

let connection: signalR.HubConnection | null = null;

const metricsHub = "hubs/metrics";

export const useSignalR = () => {
  const config = useRuntimeConfig();
  const store = useRealTimeStore();
  const appLogger = useAppLoggerStore();
  const notifications = useNotificationsStore();

  const autoconnect = useLocalStorage("iiot-signalr-autoconnect", false);

  const toggleAutoconnect = (value?: boolean) => {
    autoconnect.value = value ?? !autoconnect.value;
  };

  const connect = async () => {
    if (connection?.state == signalR.HubConnectionState.Connected) {
      appLogger.log.info("signalr-connection", "Already connected");
      return;
    }

    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${config.public.apiBase}/${metricsHub}`)
      .withAutomaticReconnect()
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
      } else if (entityType === "SENSOR") {
        refreshNuxtData("sensors");
      }
    });

    connection.on("SystemAlert", (message: string, level: string) => {
      appLogger.log.warning(
        "signalr-alert",
        `System Alert (${level}): ${message}`,
      );
      useNotificationsStore().add("System Alert", message, level as AlertLevel);
    });

    connection.onreconnecting(() => {
      appLogger.log.general("signalr-reconnect", "Reconnecting...");
      store.isConnected = false;
    });
    connection.onreconnected(() => {
      appLogger.log.general("signalr-reconnect", "Reconnected");
      store.isConnected = true;
    });
    connection.onclose(() => {
      appLogger.log.info("signalr-close", "Connection closed");
      store.isConnected = false;
    });

    try {
      await connection.start();
      store.isConnected = true;
      notifications.add("SignalR", `Connected to ${metricsHub}`, "INFO");

      appLogger.log.info("signalr-status", "SignalR Connected");
    } catch (e) {
      store.isConnected = false;
      appLogger.log.error("signalr-error", `Connection failed: ${e}`);
      useNotificationsStore().add(
        "Connection Failed",
        `SignalR: ${e}`,
        "CRITICAL",
      );
    }
  };
  const disconnect = async () => {
    await connection?.stop();
    connection = null;
    appLogger.log.error("signalr-status", "SignalR Disconnected");
    notifications.add("SignalR", "Disconnected", "CRITICAL");
  };

  return {
    autoconnect,
    toggleAutoconnect,
    connect,
    disconnect,
    isConnected: computed(() => store.isConnected),
  };
};
