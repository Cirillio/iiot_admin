import type { paths } from "~/types/api-generated";
import { BaseApiService } from "./BaseApiService";

export class DevicesService extends BaseApiService {
  async list(limit?: number) {
    return await this.$http<
      paths["/api/devices"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/devices", { query: { limit } });
  }

  async create(
    data: NonNullable<paths["/api/devices"]["post"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<
      paths["/api/devices"]["post"]["responses"]["200"]["content"]["application/json"]
    >("/api/devices", { method: "POST", body: data });
  }

  async getById(id: number) {
    return await this.$http<
      paths["/api/devices/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/api/devices/${id}`);
  }

  async update(
    id: number,
    data: NonNullable<paths["/api/devices/{id}"]["put"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<undefined>(`/api/devices/${id}`, { method: "PUT", body: data });
  }

  async delete(id: number) {
    return await this.$http<undefined>(`/api/devices/${id}`, { method: "DELETE" });
  }
}
