import type { paths } from "~/types/api-generated";

export const useApi = () => {
  const config = useRuntimeConfig();

  const $http = $fetch.create({
    baseURL: config.public.apiBase,
  });

  return {
    system: {
      status: () =>
        $http<
          paths["/api/system/status"]["get"]["responses"]["200"]["content"]["application/json"]
        >("/api/system/status"),
    },
    devices: {
      list: (limit?: number) =>
        $http<
          paths["/api/devices"]["get"]["responses"]["200"]["content"]["application/json"]
        >("/api/devices", { query: { limit } }),
    },
  };
};
