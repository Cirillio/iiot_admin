<script lang="ts" setup>
import { reloadIcon, systemIcon, warningIcon, checkIcon, errorIcon, databaseIcon, timerIcon } from "~/core/icons-map";
import type { ServiceStatus } from "~/types/models";

definePageMeta({
  title: "System Status",
  description: "Health monitoring of all system services",
});

const api = useApi();

const { data, pending, refresh } = useAsyncData(
  "system-status",
  () => api.system.getStatus(),
  { immediate: true, watch: [], server: false },
);

useIntervalFn(refresh, 30_000);

// --- Helpers ---

const STATUS_COLOR: Record<ServiceStatus, "success" | "error" | "warning" | "neutral"> = {
  ONLINE: "success",
  OFFLINE: "error",
  DEGRADED: "warning",
  CRITICAL_ERROR: "error",
  MAINTENANCE: "neutral",
};

const STATUS_RING: Record<ServiceStatus, string> = {
  ONLINE: "ring-success/30",
  OFFLINE: "ring-error/30",
  DEGRADED: "ring-warning/30",
  CRITICAL_ERROR: "ring-error/30",
  MAINTENANCE: "ring-neutral/30",
};

const STATUS_DOT: Record<ServiceStatus, string> = {
  ONLINE: "bg-success",
  OFFLINE: "bg-error",
  DEGRADED: "bg-warning",
  CRITICAL_ERROR: "bg-error",
  MAINTENANCE: "bg-neutral-400",
};

const STATUS_ICON: Record<ServiceStatus, string> = {
  ONLINE: checkIcon,
  OFFLINE: errorIcon,
  DEGRADED: warningIcon,
  CRITICAL_ERROR: errorIcon,
  MAINTENANCE: systemIcon,
};

const STATUS_LABEL: Record<ServiceStatus, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  DEGRADED: "Degraded",
  CRITICAL_ERROR: "Critical Error",
  MAINTENANCE: "Maintenance",
};

function formatUptime(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatLastSync(iso: string | undefined): string {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Toolbar -->
    <div class="flex items-center justify-between border-b border-default px-4 py-3 shrink-0">
      <div class="flex items-center gap-2">
        <Icon :name="systemIcon" class="text-muted size-4" />
        <span class="text-sm font-medium">System Status</span>
        <UBadge color="neutral" variant="outline" size="sm" :label="`${data?.length ?? 0} services`" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted">auto-refresh 30s</span>
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          :loading="pending"
          @click="refresh()"
        />
      </div>
    </div>

    <!-- Content -->
    <ScrollableWrapper>
      <div class="p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Skeleton -->
        <template v-if="pending && !data">
          <div
            v-for="i in 3"
            :key="i"
            class="h-48 rounded-xl ring ring-default animate-pulse"
          />
        </template>

        <!-- Cards -->
        <template v-else-if="data && data.length > 0">
          <div
            v-for="service in data"
            :key="service.serviceName ?? ''"
            class="flex flex-col gap-4 rounded-xl ring p-5 transition-shadow duration-200"
            :class="STATUS_RING[service.status as ServiceStatus]"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <!-- Pulse dot -->
                <span class="relative flex size-2.5 shrink-0">
                  <span
                    v-if="service.status === 'ONLINE'"
                    class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                    :class="STATUS_DOT[service.status as ServiceStatus]"
                  />
                  <span
                    class="relative inline-flex size-2.5 rounded-full"
                    :class="STATUS_DOT[service.status as ServiceStatus]"
                  />
                </span>
                <div class="flex flex-col gap-0.5 min-w-0">
                  <span class="font-mono text-sm font-semibold truncate">{{ service.serviceName }}</span>
                  <span class="text-xs text-muted">IIoT Collector Service</span>
                </div>
              </div>
              <UBadge
                :color="STATUS_COLOR[service.status as ServiceStatus]"
                :label="STATUS_LABEL[service.status as ServiceStatus]"
                variant="subtle"
                size="sm"
                class="shrink-0"
              />
            </div>

            <USeparator />

            <!-- Metrics -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                  <Icon :name="timerIcon" class="size-3.5 text-muted" />
                  <span class="text-xs text-muted uppercase tracking-wider">Uptime</span>
                </div>
                <span class="font-mono text-base font-semibold tabular-nums">
                  {{ formatUptime(service.uptimeSeconds) }}
                </span>
              </div>
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                  <Icon :name="databaseIcon" class="size-3.5 text-muted" />
                  <span class="text-xs text-muted uppercase tracking-wider">Last Sync</span>
                </div>
                <span class="font-mono text-base font-semibold tabular-nums">
                  {{ formatLastSync(service.lastSync) }}
                </span>
              </div>
            </div>

            <!-- Error -->
            <div
              v-if="service.lastError"
              class="rounded-lg ring ring-error/20 px-3 py-2.5"
            >
              <div class="flex items-center gap-1.5 mb-1.5">
                <Icon :name="warningIcon" class="size-3.5 text-error shrink-0" />
                <span class="text-xs font-medium text-error tracking-wide uppercase">Last Error</span>
              </div>
              <p class="font-mono text-xs text-error/70 break-all leading-relaxed">{{ service.lastError }}</p>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <div v-else class="col-span-full py-20 text-center text-sm text-muted">
          No services reporting. Collector may be offline.
        </div>
      </div>
    </ScrollableWrapper>
  </div>
</template>
