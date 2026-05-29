import { DevicesService } from "../services/DevicesService";
import { TagsService } from "../services/TagsService";
import { ConnectionsService } from "../services/ConnectionsService";
import { MetricsService } from "../services/MetricsService";
import { SystemService } from "../services/SystemService";
import { ControlService } from "../services/ControlService";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const $http = $fetch.create({
    baseURL: config.public.apiBase,
  });

  return {
    provide: {
      api: {
        devices: new DevicesService($http),
        tags: new TagsService($http),
        connections: new ConnectionsService($http),
        metrics: new MetricsService($http),
        system: new SystemService($http),
        control: new ControlService($http),
      },
    },
  };
});
