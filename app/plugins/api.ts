import { DevicesService } from "../services/DevicesService";
import { SensorsService } from "../services/SensorsService";
import { MetricsService } from "../services/MetricsService";
import { SystemService } from "../services/SystemService";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const $http = $fetch.create({
    baseURL: config.public.apiBase,
  });

  return {
    provide: {
      api: {
        devices: new DevicesService($http),
        sensors: new SensorsService($http),
        metrics: new MetricsService($http),
        system: new SystemService($http),
      },
    },
  };
});
