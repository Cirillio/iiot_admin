import { defineStore } from "pinia";
import type { AlertLevel } from "~/types/api";

// SUCCESS — локальный уровень UI (зелёный тост для успешных операций); в бэкенд-AlertLevel его нет.
export type NotificationLevel = AlertLevel | "SUCCESS";

export interface Notification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  date: string;
  read: boolean;
}

const TOAST_COLOR_MAP: Record<NotificationLevel, "error" | "warning" | "info" | "success"> =
  {
    CRITICAL: "error",
    WARNING: "warning",
    INFO: "info",
    SUCCESS: "success",
  };

const TOAST_DURATION_MAP: Record<NotificationLevel, number> = {
  CRITICAL: 8000,
  WARNING: 5000,
  INFO: 3000,
  SUCCESS: 3000,
};

const LOG_STATUS_MAP: Record<NotificationLevel, "error" | "warning" | "info"> = {
  CRITICAL: "error",
  WARNING: "warning",
  INFO: "info",
  SUCCESS: "info",
};

export const useNotificationsStore = defineStore("Notifications", () => {
  const toast = useToast();
  const appLogger = useAppLoggerStore();

  const items = ref<Notification[]>([]);

  const unreadCount = computed(() => items.value.filter((n) => !n.read).length);
  const hasUnreadErrors = computed(() =>
    items.value.some((n) => !n.read && n.level === "CRITICAL"),
  );

  const add = (
    title: string,
    message: string,
    level: NotificationLevel = "INFO",
  ) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      level,
      date: new Date().toISOString(),
      read: false,
    };

    items.value.unshift(notification);

    toast.add({
      title,
      description: message,
      color: TOAST_COLOR_MAP[level],
      duration: TOAST_DURATION_MAP[level],
    });

    // Каждое уведомление попадает в журнал — попап показывает только последние.
    appLogger.log[LOG_STATUS_MAP[level]](title, message);
  };

  const markAllRead = () => items.value.forEach((n) => (n.read = true));

  const dismiss = (id: string) => {
    items.value = items.value.filter((n) => n.id !== id);
  };

  const clearAll = () => {
    items.value = [];
  };

  return {
    items,
    unreadCount,
    hasUnreadErrors,
    add,
    markAllRead,
    dismiss,
    clearAll,
  };
});
