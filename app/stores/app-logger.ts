import { defineStore } from "pinia";

export type LogStatusType = "error" | "warning" | "info" | "general";

export interface LogItem {
  tag: string;
  date: string;
  status: LogStatusType;
  message: string;
}

const MAX_LOGS = 200;

export const useAppLoggerStore = defineStore("AppLogger", () => {
  const logs = ref<LogItem[]>([]);

  const push = (tag: string, status: LogStatusType, message: string) => {
    logs.value.push({ tag, date: new Date().toISOString(), status, message });
    if (logs.value.length > MAX_LOGS) logs.value.shift();
  };

  const clear = (tag?: string) => {
    logs.value = tag ? logs.value.filter((l) => l.tag !== tag) : [];
  };

  const exportLogs = (tag?: string): LogItem[] =>
    tag ? logs.value.filter((l) => l.tag === tag) : [...logs.value];

  return {
    logs,
    log: {
      error:   (tag: string, message: string) => push(tag, "error",   message),
      warning: (tag: string, message: string) => push(tag, "warning", message),
      info:    (tag: string, message: string) => push(tag, "info",    message),
      general: (tag: string, message: string) => push(tag, "general", message),
    },
    clear,
    exportLogs,
  };
});
