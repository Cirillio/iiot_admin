import type { paths } from "~/types/api-generated";
import type { DeviceCommand } from "~/types/api";
import { BaseApiService } from "./BaseApiService";

type WriteBody = NonNullable<
  paths["/api/v1/control/write"]["post"]["requestBody"]
>["content"]["application/json"];

export class ControlService extends BaseApiService {
  /**
   * Отправляет команду записи в исполнительный механизм (Coil/Holding).
   * Возвращает созданную команду (202 Accepted); клиент отслеживает статус по id.
   */
  async write(data: WriteBody) {
    return await this.$http<DeviceCommand>("/api/v1/control/write", {
      method: "POST",
      body: data,
    });
  }
}
