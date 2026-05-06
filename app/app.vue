<template>
  <UApp>
    <UContainer class="py-10">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold font-mono text-primary">IIoT System Status</h1>
            <UButton
              :icon="icons.reload"
              label="reload"
              :loading="status === 'pending'"
              @click="() => refresh()"
            />
          </div>
        </template>

        <div
          v-if="error"
          class="text-error bg-error/10 p-4 rounded-md border border-error/20 font-mono"
        >
          <p class="font-bold">Error connecting to backend:</p>
          <pre class="text-sm mt-2 whitespace-pre-wrap">{{ error.message }}</pre>
          <p class="text-sm mt-2 text-neutral-500 italic">
            Check if Docker containers are running (make status)
          </p>
        </div>

        <div v-else-if="data" class="space-y-4">
          <div
            v-for="svc in data"
            :key="svc.serviceName!"
            class="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50"
          >
            <div class="flex items-center gap-3">
              <div
                class="size-3 rounded-full animate-pulse"
                :class="svc.status === 'ONLINE' ? 'bg-success' : 'bg-error'"
              />
              <span class="font-bold font-mono">{{ svc.serviceName }}</span>
            </div>
            <div class="text-right">
              <UBadge
                :color="svc.status === 'ONLINE' ? 'success' : 'error'"
                variant="subtle"
              >
                {{ svc.status }}
              </UBadge>
              <p class="text-xs text-neutral-500 mt-1">
                Uptime: {{ formatUptime(svc.uptimeSeconds ?? 0) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-10 opacity-50 italic"
        >
          <p>Requesting status...</p>
        </div>
      </UCard>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
import { icons } from "./core/icons-map";

const api = useApi();

const { data, status, error, refresh } = await useAsyncData("system-status", () =>
  api.system.getStatus()
);

const formatUptime = (seconds: number) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};
</script>
