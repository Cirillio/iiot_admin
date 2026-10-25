// Извлекает понятное пользователю сообщение об ошибке из ответа API, FluentValidation или исключения.
export function extractErrorMessage(err: unknown, fallback = 'Operation failed'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err

  const anyErr = err as {
    data?: {
      message?: string
      title?: string
      detail?: string
      errors?: Record<string, string[]>
    }
    statusMessage?: string
    message?: string
  }

  const data = anyErr.data
  if (data) {
    if (data.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0]
      if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey]!.length > 0) {
        return data.errors[firstKey]![0]!
      }
    }
    if (data.message && typeof data.message === 'string') return data.message
    if (data.detail && typeof data.detail === 'string') return data.detail
    if (data.title && typeof data.title === 'string') return data.title
  }

  if (anyErr.message && typeof anyErr.message === 'string') {
    return anyErr.message
  }

  return fallback
}
