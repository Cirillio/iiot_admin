import type { paths } from "~/types/api-generated";
import { BaseApiService } from "./BaseApiService";

export class MetricsService extends BaseApiService {
  async getHistory(
    query: paths["/api/metrics/history"]["get"]["parameters"]["query"],
  ) {
    return await this.$http<
      paths["/api/metrics/history"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/metrics/history", { query });
  }
}
