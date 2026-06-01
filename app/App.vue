<script setup lang="ts">
const { isFluid } = useLayout();
const route = useRoute();

// Заголовок вкладки: «<Название страницы> | IIoT - SCADA».
useHead({
  title: () => (route.meta.title as string | undefined) ?? "",
  titleTemplate: (t) => (t ? `${t} | IIoT - SCADA` : "IIoT - SCADA"),
});
</script>

<template>
  <UApp>
    <u-container
      :class="[
        'mx-auto w-full  overflow-y-hidden transition-all duration-300 ease-in-out h-dvh',
        isFluid ? 'max-w-full' : 'max-w-6xl',
      ]"
    >
      <div class="h-full py-2 flex gap-2 w-full flex-col">
        <app-toolbar />
        <NuxtLayout>
          <NuxtErrorBoundary>
            <NuxtPage />

            <template #error="{ error, clearError }">
              <div
                class="size-full flex flex-col items-center justify-center p-10 text-center gap-6"
              >
                <!-- Авто-сброс при смене маршрута -->
                <div
                  v-if="
                    watch(
                      () => route.path,
                      () => clearError(),
                      {
                        immediate: true,
                        deep: true,
                      },
                    )
                  "
                />

                <div class="space-y-2">
                  <h1 class="text-4xl font-bold font-mono text-primary">
                    {{ (error as any)?.statusCode || "ERROR" }}
                  </h1>
                  <p class="text-muted text-lg max-w-md">
                    {{
                      error?.message || "Что-то пошло не так в модуле страницы."
                    }}
                  </p>
                </div>

                <UButton
                  label="Try Again"
                  color="primary"
                  variant="subtle"
                  icon="i-lucide-refresh-cw"
                  size="xl"
                  @click="clearError"
                />
              </div>
            </template>
          </NuxtErrorBoundary>
        </NuxtLayout>
        <app-footer />
      </div>
    </u-container>
  </UApp>
</template>

<style>
@keyframes grid-drift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -40px 40px;
  }
}

body {
  background-image: radial-gradient(
    circle,
    var(--ui-color-neutral-500) 1px,
    transparent 1px
  );
  background-size: 40px 40px;
  animation: grid-drift 6s linear infinite;
}
</style>
