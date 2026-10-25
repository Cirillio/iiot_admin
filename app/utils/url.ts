// Нормализует базовый адрес API и путь эндпоинта, предотвращая сдвоенные слэши.
export function buildApiUrl(base: string, path: string): string {
  const trimmedBase = (base || '').replace(/\/+$/, '')
  const trimmedPath = (path || '').replace(/^\/+/, '')
  return trimmedPath ? `${trimmedBase}/${trimmedPath}` : trimmedBase
}
