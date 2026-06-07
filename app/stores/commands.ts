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

/** Порядок прогресса статуса. Нужен, чтобы статус был монотонным и не «откатывался назад». */
const STATUS_RANK: Record<CommandStatus, number> = {
  [COMMAND_STATUS.PENDING]: 0,
  [COMMAND_STATUS.PROCESSING]: 1,
  [COMMAND_STATUS.SUCCESS]: 2,
  [COMMAND_STATUS.FAILED]: 2,
};

export const useCommandsStore = defineStore("Commands", () => {
  const entries = reactive(new Map<string, CommandEntry>());
  const appLogger = useAppLoggerStore();
  const notifications = useNotificationsStore();

  /** Состояние подключения к каналу диспетчеризации (ControlHub). */
  const isConnected = ref<boolean>(false);

  /** Регистрирует команду в момент отправки (ответ 202). tagId известен на этой стороне. */
  function register(command: DeviceCommand) {
    const prev = entries.get(command.id);
    // Гонка: терминальное событие из ControlHub (SUCCESS/FAILED) на локальном стенде может
    // прийти РАНЬШЕ, чем вернётся HTTP-ответ 202. register() выполняется после await, поэтому
    // без защиты он затёр бы уже финальный статус обратно в PENDING → кнопка зависает в загрузке.
    const keepPrev = prev != null && STATUS_RANK[prev.status] >= STATUS_RANK[command.status];
    entries.set(command.id, {
      commandId: command.id,
      tagId: command.tagId, // tagId известен только здесь — проставляем всегда
      status: keepPrev ? prev.status : command.status,
      errorMessage: keepPrev ? prev.errorMessage : command.errorMessage,
      updatedAt: keepPrev ? prev.updatedAt : command.updatedAt,
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
    const prevRank = prev ? STATUS_RANK[prev.status] : -1;
    // Не понижаем статус и не реагируем на дубликаты/опоздавшие события.
    const advances = STATUS_RANK[evt.status] > prevRank;

    entries.set(evt.commandId, {
      commandId: evt.commandId,
      tagId: prev?.tagId ?? null,
      status: advances ? evt.status : prev!.status,
      errorMessage: evt.errorMessage ?? prev?.errorMessage ?? null,
      updatedAt: new Date().toISOString(),
    });

    if (!advances) return;

    const tagRef = prev?.tagId != null ? `tag ${prev.tagId}` : evt.commandId.slice(0, 8);
    if (evt.status === COMMAND_STATUS.FAILED) {
      notifications.add("Command failed", `Write to ${tagRef} failed${evt.errorMessage ? `: ${evt.errorMessage}` : ""}`, "CRITICAL");
    } else if (evt.status === COMMAND_STATUS.SUCCESS) {
      notifications.add("Command applied", `Write to ${tagRef} succeeded`, "SUCCESS");
    } else {
      appLogger.log.general("commands-status", `Command ${evt.commandId} → ${evt.status}`);
    }
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
