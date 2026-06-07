import type { paths } from "~/types/api-generated";
import { BaseApiService } from "./BaseApiService";

export class ConnectionsService extends BaseApiService {
  async list() {
    return await this.$http<
      paths["/api/connections"]["get"]["responses"]["200"]["content"]["application/json"]
    >("/api/connections");
  }

  async create(
    data: NonNullable<paths["/api/connections"]["post"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<
      paths["/api/connections"]["post"]["responses"]["200"]["content"]["application/json"]
    >("/api/connections", { method: "POST", body: data });
  }

  async getById(id: number) {
    return await this.$http<
      paths["/api/connections/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
    >(`/api/connections/${id}`);
  }

  async update(
    id: number,
    data: NonNullable<paths["/api/connections/{id}"]["put"]["requestBody"]>["content"]["application/json"],
  ) {
    return await this.$http<undefined>(`/api/connections/${id}`, { method: "PUT", body: data });
  }

  async delete(id: number) {
    return await this.$http<undefined>(`/api/connections/${id}`, { method: "DELETE" });
  }
}
