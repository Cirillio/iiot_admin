import type { components } from "./api-generated.d.ts";

type Schemas = components["schemas"];

// --- Enums ---

export type SensorDataType = Schemas["SensorDataType"];
export type ServiceStatus = Schemas["ServiceStatus"];

export const SENSOR_DATA_TYPE = {
  ANALOG: "ANALOG",
  DIGITAL: "DIGITAL",
  VIRTUAL: "VIRTUAL",
} as const satisfies Record<SensorDataType, SensorDataType>;

export const SERVICE_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  DEGRADED: "DEGRADED",
  CRITICAL_ERROR: "CRITICAL_ERROR",
  MAINTENANCE: "MAINTENANCE",
} as const satisfies Record<ServiceStatus, ServiceStatus>;

// --- Domain models ---

export type Device = Schemas["Device"];
export type SensorSettings = Schemas["SensorSettings"];
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
