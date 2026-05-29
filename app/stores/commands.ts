import { defineStore } from "pinia";
import {
  COMMAND_STATUS,
  type CommandStatus,
  type CommandStatusEvent,
  type DeviceCommand,
} from "~/types/api";

export interface CommandEntry {
  commandId: string;
  tagId: number | null;
  status: CommandStatus;
  errorMessage: string | null;
  updatedAt: string;
}

/** Статусы, при которых команда ещё в работе (кнопка заблокирована, крутится лоадер). */
const IN_FLIGHT: CommandStatus[] = [COMMAND_STATUS.PENDING, COMMAND_STATUS.PROCESSING];

export const useCommandsStore = defineStore("Commands", () => {
  const entries = reactive(new Map<string, CommandEntry>());
  const appLogger = useAppLoggerStore();

  /** Состояние подключения к каналу диспетчеризации (ControlHub). */
  const isConnected = ref<boolean>(false);

  /** Регистрирует команду в момент отправки (ответ 202). tagId известен на этой стороне. */
  function register(command: DeviceCommand) {
    entries.set(command.id, {
      commandId: command.id,
      tagId: command.tagId,
      status: command.status,
      errorMessage: command.errorMessage,
      updatedAt: command.updatedAt,
    });
    appLogger.log.info(
      "commands-register",
      `Command ${command.id} registered for tag ${command.tagId} (status ${command.status})`,
    );
  }

  /** Обрабатывает событие канала диспетчеризации (ControlHub.CommandStatusChanged). */
  function onStatusEvent(json: string) {
    let evt: CommandStatusEvent;
    try {
      evt = JSON.parse(json) as CommandStatusEvent;
    } catch (e) {
      appLogger.log.error("commands-parse-error", `Failed to parse command event: ${e}`);
      return;
    }

    const prev = entries.get(evt.commandId);
    entries.set(evt.commandId, {
      commandId: evt.commandId,
      tagId: prev?.tagId ?? null,
      status: evt.status,
      errorMessage: evt.errorMessage,
      updatedAt: new Date().toISOString(),
    });

    const logTag = `commands-status`;
    const line = `Command ${evt.commandId} → ${evt.status}${evt.errorMessage ? ` (${evt.errorMessage})` : ""}`;
    if (evt.status === COMMAND_STATUS.FAILED) appLogger.log.error(logTag, line);
    else appLogger.log.general(logTag, line);
  }

  function getByCommandId(commandId: string) {
    return entries.get(commandId);
  }

  /** Последняя команда по тегу — для индикации «по этому тегу идёт запись» на карточке. */
  function getByTagId(tagId: number) {
    let latest: CommandEntry | undefined;
    for (const e of entries.values()) {
      if (e.tagId !== tagId) continue;
      if (!latest || e.updatedAt > latest.updatedAt) latest = e;
    }
    return latest;
  }

  function isInFlight(status: CommandStatus | undefined) {
    return status != null && IN_FLIGHT.includes(status);
  }

  return {
    entries,
    isConnected,
    register,
    onStatusEvent,
    getByCommandId,
    getByTagId,
    isInFlight,
  };
});
