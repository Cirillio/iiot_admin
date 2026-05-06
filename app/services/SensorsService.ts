import type { paths } from "~/types/api-generated";
import { BaseApiService } from "./BaseApiService";

export class SensorsService extends BaseApiService {
  async list() {
    return await this.$http<
      paths["/api/sensors"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/sensors");
  }

  async create(
    data: NonNullable<paths["/api/sensors"]["post"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<
      paths["/api/sensors"]["post"]["responses"]["200"]["content"]["application/json"]
    >("/api/sensors", { method: "POST", body: data });
  }

  async getById(id: number) {
    return await this.$http<
      paths["/api/sensors/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/api/sensors/${id}`);
  }

  async update(
    id: number,
    data: NonNullable<paths["/api/sensors/{id}"]["put"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<
      paths["/api/sensors/{id}"]["put"]["responses"]["200"]
    >(`/api/sensors/${id}`, { method: "PUT", body: data });
  }

  async delete(id: number) {
    return await this.$http<
      paths["/api/sensors/{id}"]["delete"]["responses"]["200"]
    >(`/api/sensors/${id}`, { method: "DELETE" });
  }

  async getByDeviceId(deviceId: number) {
    return await this.$http<
      paths["/api/sensors/device/{deviceId}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/api/sensors/device/${deviceId}`);
  }
}
