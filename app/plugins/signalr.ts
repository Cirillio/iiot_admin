export default defineNuxtPlugin((nuxtApp) => {
  const { connect, autoconnect } = useSignalR();
  const { connect: connectControl } = useControlHub();

  // Инициализируем только на клиенте
  if (import.meta.client) {
    nuxtApp.hook("app:mounted", () => {
      if (autoconnect.value) {
        connect();
        connectControl();
      }
    });
  }
});
