export default defineNuxtPlugin((nuxtApp) => {
  const { connect, autoconnect } = useSignalR();

  // Инициализируем только на клиенте
  if (import.meta.client) {
    nuxtApp.hook("app:mounted", () => {
      if (autoconnect.value) {
        connect();
      }
    });
  }
});
