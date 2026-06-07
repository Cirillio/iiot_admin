import type { components } from "./api-generated.d.ts";

type Schemas = components["schemas"];

// --- Enums ---

export type TagDataType = Schemas["TagDataType"];
export type ModbusRegisterType = Schemas["ModbusRegisterType"];
export type ModbusEndianness = Schemas["ModbusEndianness"];
export type ServiceStatus = Schemas["ServiceStatus"];

export const TAG_DATA_TYPE = {
  ANALOG_RAW: "ANALOG_RAW",
  ANALOG_PHYSICAL: "ANALOG_PHYSICAL",
  DIGITAL: "DIGITAL",
} as const satisfies Record<TagDataType, TagDataType>;

export const MODBUS_REGISTER_TYPE = {
  INPUT_REGISTER: "INPUT_REGISTER",
  HOLDING_REGISTER: "HOLDING_REGISTER",
  DISCRETE_INPUT: "DISCRETE_INPUT",
  COIL: "COIL",
} as const satisfies Record<ModbusRegisterType, ModbusRegisterType>;

export const MODBUS_ENDIANNESS = {
  BIG_ENDIAN: "BIG_ENDIAN",
  LITTLE_ENDIAN: "LITTLE_ENDIAN",
  WORD_SWAP: "WORD_SWAP",
  BYTE_WORD_SWAP: "BYTE_WORD_SWAP",
} as const satisfies Record<ModbusEndianness, ModbusEndianness>;

export const TAG_TYPE_COLOR: Record<TagDataType, "info" | "success"> = {
  ANALOG_RAW: "info",
  ANALOG_PHYSICAL: "info",
  DIGITAL: "success",
};

export const SERVICE_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  DEGRADED: "DEGRADED",
  CRITICAL_ERROR: "CRITICAL_ERROR",
  MAINTENANCE: "MAINTENANCE",
} as const satisfies Record<ServiceStatus, ServiceStatus>;

// --- Domain models ---

export type Device = Schemas["Device"];
export type TagSettings = Schemas["TagSettings"];
export type TagUiConfig = Schemas["TagUiConfig"];
export type ModbusConnection = Schemas["ModbusConnection"];
export type SystemConfig = Schemas["SystemConfig"];
export type SystemStatus = Schemas["SystemStatus"];

// --- Dashboard DTOs ---

export type DashboardDevice = Schemas["DashboardDeviceDTO"];
export type DashboardTag = Schemas["DashboardTagDTO"];

// --- Request DTOs ---

export type CreateDeviceDto = Schemas["CreateDeviceDto"];
export type UpdateDeviceDto = Schemas["UpdateDeviceDto"];
export type CreateTagDto = Schemas["CreateTagDto"];
export type UpdateTagDto = Schemas["UpdateTagDto"];
export type CreateConnectionDto = Schemas["CreateConnectionDto"];
export type UpdateConnectionDto = Schemas["UpdateConnectionDto"];
export type WriteCommandDto = Schemas["WriteCommandDto"];

// --- Supervisory Control (ручные типы: SignalR-контракт и ответ write вне OpenAPI-схемы) ---

export type {
  CommandStatus,
  DeviceCommand,
  CommandStatusEvent,
} from "./api";
export { COMMAND_STATUS } from "./api";
