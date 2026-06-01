import { defineStore } from "pinia";
import type { Metric } from "~/types/api";

export const useRealTimeStore = defineStore("RealTime", () => {
  const values = reactive(new Map<number, Metric>());
  const appLogger = useAppLoggerStore();
  const alerts = useAlertsStore();

  const isConnected = ref<boolean>(false);

  function onMetric(json: string) {
    try {
      const metric = JSON.parse(json) as Metric;
      values.set(metric.tagId, metric);
      // Per-metric логирование отключено намеренно: на потоке телеметрии оно
      // забивает буфер логгера (MAX_LOGS) за секунды. Значимые события —
      // пересечения порогов — поднимает alerts-движок.
      alerts.onMetric(metric);
    } catch (e) {
      appLogger.log.error("realtime-store-parse-error", `Failed to parse metric: ${e}`);
    }
  }

  /** Инициализация снимком последних значений из REST (до прихода live-метрик). */
  function seed(metrics: Metric[]) {
    for (const m of metrics) {
      values.set(m.tagId, m);
      alerts.prime(m); // тихо: без алертов на каждой перезагрузке
    }
  }

  function getMetricByTagId(tagId: number) {
    return values.get(tagId);
  }

  return {
    // Data
    values,
    isConnected,
    // Actions
    onMetric,
    seed,
    getMetricByTagId,
  };
});
