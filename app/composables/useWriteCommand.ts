/** Пока нет слоя аутентификации — оператор-заглушка для аудита. TODO: брать из auth-токена. */
const OPERATOR_ID = "usr_admin_01";

/**
 * Инкапсулирует поток команды управления (раздел 8 ТЗ):
 * отправка → регистрация → отслеживание статуса по commandId → тосты на Success/Failed.
 */
export const useWriteCommand = (tagId: number) => {
  const api = useApi();
  const commands = useCommandsStore();
  const notifications = useNotificationsStore();
  const appLogger = useAppLoggerStore();

  const commandId = ref<string | null>(null);

  const entry = computed(() =>
    commandId.value ? commands.getByCommandId(commandId.value) : undefined,
  );
  const status = computed(() => entry.value?.status);
  const isInFlight = computed(() => commands.isInFlight(status.value));
  const errorMessage = computed(() => entry.value?.errorMessage ?? null);

  // Уведомления о жизненном цикле команды (SUCCESS/FAILED) поднимает commands store
  // глобально — здесь дублировать не нужно, иначе оператор получит двойной тост.

  async function send(value: number) {
    try {
      appLogger.log.info("control-write", `Tag ${tagId} <= ${value} (sending)`);
      const cmd = await api.control.write({ tagId, value, operatorId: OPERATOR_ID });
      commands.register(cmd);
      commandId.value = cmd.id;
    } catch (e) {
      appLogger.log.error("control-write", `Send failed for tag ${tagId}: ${e}`);
      notifications.add("Ошибка отправки", `Тег ${tagId}: ${e}`, "CRITICAL");
    }
  }

  return { send, status, isInFlight, errorMessage, commandId };
};
