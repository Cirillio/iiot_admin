import type { paths } from "~/types/api-generated";
import type {
  Metric,
  MetricsRawParams,
  PagedResult,
  RawMetric,
} from "~/types/api";
import { BaseApiService } from "./BaseApiService";

export class MetricsService extends BaseApiService {
  async getHistory(
    query: paths["/api/metrics/history"]["get"]["parameters"]["query"],
  ) {
    return await this.$http<
      paths["/api/metrics/history"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/metrics/history", { query });
  }

  /** Последнее показание по каждому тегу — снимок для инициализации UI. */
  async getLatest() {
    return await this.$http<Metric[]>("/api/metrics/latest");
  }

  /** Постраничная выборка сырых метрик для табличного просмотра (новые сверху). */
  async getRaw(query: MetricsRawParams = {}) {
    return await this.$http<PagedResult<RawMetric>>("/api/metrics/raw", {
      query,
    });
  }
}
