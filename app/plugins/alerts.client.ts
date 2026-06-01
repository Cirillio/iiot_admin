export default defineNuxtPlugin((nuxtApp) => {
  // Снимок состояния на клиенте после монтирования:
  // 1) реестр тегов (имена/пороги) — нужен для оценки статусов,
  // 2) последние значения метрик — чтобы карточки и АРМ показывали состояние
  //    сразу после перезагрузки, не дожидаясь следующего live-опроса.
  nuxtApp.hook("app:mounted", async () => {
    const alerts = useAlertsStore();
    const realtime = useRealTimeStore();
    await alerts.refresh();
    try {
      const latest = await useApi().metrics.getLatest();
      realtime.seed(latest ?? []);
    } catch {
      // снимок не критичен — при сбое значения подтянутся live-метриками
    }
  });
});
