import type { paths } from "~/types/api-generated";
import { BaseApiService } from "./BaseApiService";

export class TagsService extends BaseApiService {
  async list() {
    return await this.$http<
      paths["/api/tags"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/tags");
  }

  async create(
    data: NonNullable<paths["/api/tags"]["post"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<
      paths["/api/tags"]["post"]["responses"]["200"]["content"]["application/json"]
    >("/api/tags", { method: "POST", body: data });
  }

  async getById(id: number) {
    return await this.$http<
      paths["/api/tags/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/api/tags/${id}`);
  }

  async update(
    id: number,
    data: NonNullable<paths["/api/tags/{id}"]["put"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<undefined>(`/api/tags/${id}`, { method: "PUT", body: data });
  }

  async delete(id: number) {
    return await this.$http<undefined>(`/api/tags/${id}`, { method: "DELETE" });
  }

  async getByDeviceId(deviceId: number) {
    return await this.$http<
      paths["/api/tags/device/{deviceId}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/api/tags/device/${deviceId}`);
  }
}
