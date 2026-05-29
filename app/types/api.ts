// --- Error ---

/** RFC 7807 ProblemDetails — формат ошибок GlobalExceptionMiddleware */
export interface ApiError {
  status: number
  title: string
  detail: string
  instance: string
}

// --- Metrics ---

/** Одна точка на графике: [timestamp_ms, value] */
export type MetricPoint = [number, number]
export type MetricHistory = MetricPoint[]

/** Полная модель метрики (payload внутри SignalR ReceiveMetrics) */
export interface Metric {
  time: string
  tagId: number
  rawValue: number | null
  value: number
}

// --- Query params ---

export interface MetricsHistoryParams {
  tagId: number
  from: string // ISO 8601
  to: string   // ISO 8601
}

export interface DevicesListParams {
  limit?: number
}

// --- SignalR ---

export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL'
export type ConfigEntityType = 'DEVICE' | 'TAG' | 'CONNECTION'

export interface MonitoringHubEvents {
  ReceiveMetrics: (json: string) => void
  ConfigUpdated: (entityType: ConfigEntityType, entityId: number) => void
  SystemAlert: (message: string, level: AlertLevel) => void
}

// --- Supervisory Control ---

/** Жизненный цикл команды управления (соответствует enum command_status на бэкенде) */
export type CommandStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'

export const COMMAND_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const satisfies Record<CommandStatus, CommandStatus>

/**
 * Команда управления — ответ POST /api/v1/control/write (202 Accepted).
 * Ручной тип: бэкенд возвращает IActionResult, поэтому DeviceCommand пока
 * не выводится в OpenAPI-схему (источник правды — record DeviceCommand на бэкенде).
 */
export interface DeviceCommand {
  id: string
  tagId: number
  value: number
  operatorId: string
  status: CommandStatus
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Payload события канала диспетчеризации (ControlHub.CommandStatusChanged).
 * Приходит JSON-строкой, формируется триггером pg_notify('command_status_changed').
 */
export interface CommandStatusEvent {
  commandId: string
  status: CommandStatus
  errorMessage: string | null
}

export interface ControlHubEvents {
  CommandStatusChanged: (json: string) => void
}
