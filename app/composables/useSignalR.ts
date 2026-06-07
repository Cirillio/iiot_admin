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

    connection.onreconnecting(() => {
      store.isConnected = false;
      notifications.add("Metrics", "Reconnecting…", "WARNING");
    });
    connection.onreconnected(() => {
      store.isConnected = true;
      notifications.add("Metrics", "Reconnected", "SUCCESS");
    });
    connection.onclose(() => {
      store.isConnected = false;
      appLogger.log.info("signalr-close", "Connection closed");
    });

    try {
      await connection.start();
      store.isConnected = true;
      notifications.add("Metrics", "Channel connected", "SUCCESS");
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
