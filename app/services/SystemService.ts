import type { paths } from "~/types/api-generated";
import { BaseApiService } from "./BaseApiService";

export class SystemService extends BaseApiService {
  async getConfig() {
    return await this.$http<
      paths["/api/system/config"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/system/config");
  }

  async updateConfig(
    data: NonNullable<paths["/api/system/config"]["put"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<
      paths["/api/system/config"]["put"]["responses"]["200"]
    >("/api/system/config", { method: "PUT", body: data });
  }

  async getStatus() {
    return await this.$http<
      paths["/api/system/status"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/system/status");
  }
}
