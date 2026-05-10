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
  sensorId: number
  rawValue: number | null
  value: number
}

// --- Query params ---

export interface MetricsHistoryParams {
  sensorId: number
  from: string // ISO 8601
  to: string   // ISO 8601
}

export interface DevicesListParams {
  limit?: number
}

// --- SignalR ---

export type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL'
export type ConfigEntityType = 'DEVICE' | 'SENSOR'

export interface MonitoringHubEvents {
  ReceiveMetrics: (json: string) => void
  ConfigUpdated: (entityType: ConfigEntityType, entityId: number) => void
  SystemAlert: (message: string, level: AlertLevel) => void
}
