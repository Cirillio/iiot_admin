import { defineStore } from "pinia";

type Metric = {
  Time: string;
  SensorId: number;
  RawValue: number | null;
  Value: number;
};

export const useRealTimeStore = defineStore("RealTime", () => {
  const values = ref<Map<number, Metric>>(new Map());
  const appLogger = useAppLoggerStore();

  const isConnected = ref<boolean>(false);

  function onMetric(json: string) {
    const metric = JSON.parse(json) as Metric;
    values.value.set(metric.SensorId, metric);
    appLogger.log.general(
      "realtime-store-on-metric",
      `Metric recevied: ${metric.Value} | ${metric.RawValue} | ${metric.Time} | ${metric.SensorId} `,
    );
  }

  function getValueBySensorId(sensorId: number) {
    return values.value.get(sensorId)?.Value;
  }

  return {
    // Data
    values,
    isConnected,
    // Actions
    onMetric,
    getValueBySensorId,
  };
});
