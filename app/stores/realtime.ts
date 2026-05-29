import { defineStore } from "pinia";
import type { Metric } from "~/types/api";

export const useRealTimeStore = defineStore("RealTime", () => {
  const values = reactive(new Map<number, Metric>());
  const appLogger = useAppLoggerStore();

  const isConnected = ref<boolean>(false);

  function onMetric(json: string) {
    try {
      const metric = JSON.parse(json) as Metric;
      values.set(metric.tagId, metric);
      appLogger.log.general(
        "realtime-store-on-metric",
        `Metric received: ${metric.value} | ${metric.rawValue} | ${metric.time} | ${metric.tagId}`,
      );
    } catch (e) {
      appLogger.log.error("realtime-store-parse-error", `Failed to parse metric: ${e}`);
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
    getMetricByTagId,
  };
});
