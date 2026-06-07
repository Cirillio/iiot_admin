import { defineStore } from "pinia";
import type { Metric } from "~/types/api";

/** Глубина кольцевого буфера live-трендов на тег (точек для sparkline). */
const TREND_CAP = 40;

export const useRealTimeStore = defineStore("RealTime", () => {
  const values = reactive(new Map<number, Metric>());
  // Кольцевой буфер последних значений на тег — источник sparkline без обращений к API.
  // Наполняется из того же потока live-метрик; на разлогине обнуляется вместе со store.
  const trends = reactive(new Map<number, number[]>());
  const appLogger = useAppLoggerStore();
  const alerts = useAlertsStore();

  const isConnected = ref<boolean>(false);

  /** Добавляет точку в кольцевой буфер тега, удерживая длину ≤ TREND_CAP. */
  function pushTrend(tagId: number, value: number) {
    const buf = trends.get(tagId) ?? [];
    buf.push(value);
    if (buf.length > TREND_CAP) buf.shift();
    trends.set(tagId, buf);
  }

  function onMetric(json: string) {
    try {
      const metric = JSON.parse(json) as Metric;
      values.set(metric.tagId, metric);
      pushTrend(metric.tagId, metric.value);
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
      pushTrend(m.tagId, m.value);
      alerts.prime(m); // тихо: без алертов на каждой перезагрузке
    }
  }

  function getMetricByTagId(tagId: number) {
    return values.get(tagId);
  }

  /** Кольцевой буфер live-значений тега для sparkline (пустой, если данных ещё не было). */
  function getTrend(tagId: number): number[] {
    return trends.get(tagId) ?? [];
  }

  return {
    // Data
    values,
    trends,
    isConnected,
    // Actions
    onMetric,
    seed,
    getMetricByTagId,
    getTrend,
  };
});
