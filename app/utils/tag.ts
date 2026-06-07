import { MODBUS_REGISTER_TYPE } from "~/types/models";
import type {
  ModbusRegisterType,
  TagSettings,
  TagUiConfig,
  UpdateTagDto,
} from "~/types/models";
import { formatBackendEnum } from "~/utils/formatBackendEnum";

/** Бейдж класса регистра Modbus: короткая метка, признак записи (RW) и цвет. */
export interface RegisterBadge {
  label: string;
  full: string;
  rw: boolean;
  color: "warning" | "primary" | "info" | "neutral";
}

const REGISTER_BADGE: Record<ModbusRegisterType, RegisterBadge> = {
  COIL: { label: "COIL", full: "Coil — дискретный выход (RW)", rw: true, color: "warning" },
  HOLDING_REGISTER: { label: "HOLDING", full: "Holding register — аналоговый выход (RW)", rw: true, color: "primary" },
  INPUT_REGISTER: { label: "INPUT", full: "Input register — аналоговый вход (RO)", rw: false, color: "info" },
  DISCRETE_INPUT: { label: "DISCRETE", full: "Discrete input — дискретный вход (RO)", rw: false, color: "neutral" },
};

/** Резолвит бейдж класса регистра для тега (null, если тип не задан). */
export function registerBadge(rt: ModbusRegisterType | undefined): RegisterBadge | null {
  return rt ? REGISTER_BADGE[rt] : null;
}

/** Тег, гарантированно пригодный для записи: есть PK и регистр RW (Coil/Holding). */
export type WritableTag = TagSettings & { tagId: number };

/**
 * Type-guard: тег доступен для записи только если у него есть tagId и
 * его регистр — Coil (0X) или Holding (4X). Discrete Input / Input Register — read-only.
 */
export function isWritableTag(tag: TagSettings): tag is WritableTag {
  return (
    tag.tagId != null &&
    (tag.registerType === MODBUS_REGISTER_TYPE.COIL ||
      tag.registerType === MODBUS_REGISTER_TYPE.HOLDING_REGISTER)
  );
}

/**
 * Сериализует TagUiConfig в строку для UpdateTagDto.uiConfig.
 * Читается бэкендом как объект (uiConfigJson), но в DTO записи поле — JSON-строка.
 * Пустые строки приводятся к null, чтобы не засорять конфиг.
 */
export function serializeUiConfig(ui: TagUiConfig): string {
  const clean: TagUiConfig = {
    color: ui.color?.trim() || null,
    minCritical: ui.minCritical ?? null,
    minWarning: ui.minWarning ?? null,
    maxWarning: ui.maxWarning ?? null,
    maxCritical: ui.maxCritical ?? null,
    digitalWarning: ui.digitalWarning ?? null,
    digitalCritical: ui.digitalCritical ?? null,
    labelZero: ui.labelZero?.trim() || null,
    labelOne: ui.labelOne?.trim() || null,
  };
  return JSON.stringify(clean);
}

/**
 * Полный UpdateTagDto из текущего тега + точечные overrides.
 * Бэкенд PUT /api/tags/{id} делает ПОЛНУЮ замену (existing with {...dto}), поэтому
 * частичный update невозможен: каждое сохранение обязано нести все поля.
 * По умолчанию сохраняет существующий uiConfig — поэтому правка базовых полей
 * больше не затирает пороги/цвет.
 */
export function toUpdateTagDto(
  tag: TagSettings,
  overrides: Partial<UpdateTagDto> = {},
): UpdateTagDto {
  return {
    portNumber: tag.portNumber ?? 0,
    name: tag.name ?? "",
    slug: tag.slug ?? "",
    dataType: formatBackendEnum(tag.dataType),
    registerAddress: tag.registerAddress ?? 0,
    registerType: formatBackendEnum(tag.registerType),
    registerCount: tag.registerCount ?? 1,
    unit: tag.unit ?? "",
    inputMin: tag.inputMin ?? 0,
    inputMax: tag.inputMax ?? 0,
    outputMin: tag.outputMin ?? 0,
    outputMax: tag.outputMax ?? 0,
    offsetVal: tag.offsetVal ?? 0,
    uiConfig: tag.uiConfigJson ? serializeUiConfig(tag.uiConfigJson) : "",
    endianness: formatBackendEnum(tag.endianness),
    deadbandThreshold: tag.deadbandThreshold ?? null,
    rawDataType: formatBackendEnum(tag.rawDataType),
    ...overrides,
  };
}
