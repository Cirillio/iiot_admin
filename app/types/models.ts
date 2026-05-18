import type { components } from "./api-generated.d.ts";

type Schemas = components["schemas"];

// --- Enums ---

export type SensorDataType = Schemas["SensorDataType"];
export type ModbusRegisterType = Schemas["ModbusRegisterType"];
export type ServiceStatus = Schemas["ServiceStatus"];

export const SENSOR_DATA_TYPE = {
  ANALOG: "ANALOG",
  DIGITAL: "DIGITAL",
  VIRTUAL: "VIRTUAL",
} as const satisfies Record<SensorDataType, SensorDataType>;

export const MODBUS_REGISTER_TYPE = {
  INPUT_REGISTER: "INPUT_REGISTER",
  HOLDING_REGISTER: "HOLDING_REGISTER",
  DISCRETE_INPUT: "DISCRETE_INPUT",
  COIL: "COIL",
} as const satisfies Record<ModbusRegisterType, ModbusRegisterType>;

export const SENSOR_TYPE_COLOR: Record<
  SensorDataType,
  "info" | "success" | "warning"
> = {
  ANALOG: "info",
  DIGITAL: "success",
  VIRTUAL: "warning",
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
export type SensorSettings = Schemas["SensorSettings"] & {
  registerAddress?: number;
  registerType?: ModbusRegisterType;
  registerCount?: number;
};
export type SensorUiConfig = Schemas["SensorUiConfig"];
export type SystemConfig = Schemas["SystemConfig"];
export type SystemStatus = Schemas["SystemStatus"];

// --- Dashboard DTOs ---

export type DashboardDevice = Schemas["DashboardDeviceDTO"];
export type DashboardSensor = Schemas["DashboardSensorDTO"];

// --- Request DTOs ---

export type CreateDeviceDto = Schemas["CreateDeviceDto"];
export type UpdateDeviceDto = Schemas["UpdateDeviceDto"];
export type CreateSensorDto = Schemas["CreateSensorDto"];
export type UpdateSensorDto = Schemas["UpdateSensorDto"];
