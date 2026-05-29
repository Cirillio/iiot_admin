<script lang="ts" setup>
import {
  activityIcon,
  devicesIcon,
  gatewayIcon,
  plugIcon,
  reloadIcon,
  signalIcon,
  tagIcon,
} from "~/core/icons-map";
import type { TagDataType } from "~/types/models";

const TYPE_DOT: Record<TagDataType, string> = {
  ANALOG_RAW: "bg-info-500",
  ANALOG_PHYSICAL: "bg-info-500",
  DIGITAL: "bg-success-500",
  VIRTUAL: "bg-warning-500",
};

definePageMeta({
  title: "Dashboard",
  description: "IIoT system overview",
});

const api = useApi();
const rt = useRealTimeStore();
const { values: metricsValues, isConnected } = storeToRefs(rt);

const { data, pending, refresh } = useAsyncData(
  "dashboard",
  () => api.devices.list(),
  { immediate: true },
);

const devices = computed(() => data.value ?? []);

const stats = computed(() => {
  const total = devices.value.length;
  const active = devices.value.filter((d) => d.isActive).length;
  const totalTags = devices.value.reduce(
    (acc, d) => acc + (d.totalTags ?? 0),
    0,
  );
  const liveMetrics = metricsValues.value.size;
  return { total, active, totalTags, liveMetrics };
});

const getMetricValue = (tagId: number | undefined) => {
  if (tagId == null) return null;
  const m = rt.getMetricByTagId(tagId);
  return m != null ? Number(m.value).toFixed(2) : null;
};

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
});
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden">
    <!-- Page header -->
    <div
      class="flex items-center justify-between px-5 py-4 border-b border-default shrink-0"
    >
      <div class="flex flex-col gap-0.5">
        <h1 class="text-xl font-bold font-mono leading-tight">
          {{ greeting }} — <span class="text-primary">IIoT Control Panel</span>
        </h1>
        <span class="text-xs text-muted font-mono"
          >IIoT Control Panel — system overview</span
        >
      </div>
      <UButton
        :icon="reloadIcon"
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="pending"
        @click="refresh()"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-auto p-4 flex flex-col gap-5">
      <!-- Stat cards -->
      <div class="grid grid-cols-4 gap-3">
        <div
          class="rounded-lg border border-default bg-elevated/30 p-4 flex flex-col gap-1.5"
        >
          <div class="flex items-center gap-2 text-muted">
            <UIcon :name="devicesIcon" class="size-4" />
            <span class="text-xs uppercase tracking-wider">Devices</span>
          </div>
          <span class="text-3xl font-mono font-bold">{{ stats.total }}</span>
          <span class="text-xs text-muted">{{ stats.active }} active</span>
        </div>

        <div
          class="rounded-lg border border-default bg-elevated/30 p-4 flex flex-col gap-1.5"
        >
          <div class="flex items-center gap-2 text-muted">
            <UIcon :name="tagIcon" class="size-4" />
            <span class="text-xs uppercase tracking-wider">Tags</span>
          </div>
          <span class="text-3xl font-mono font-bold">{{
            stats.totalTags
          }}</span>
          <span class="text-xs text-muted">across all devices</span>
        </div>

        <div
          class="rounded-lg border border-default bg-elevated/30 p-4 flex flex-col gap-1.5"
        >
          <div class="flex items-center gap-2 text-muted">
            <UIcon :name="activityIcon" class="size-4" />
            <span class="text-xs uppercase tracking-wider">Live Metrics</span>
          </div>
          <span class="text-3xl font-mono font-bold">{{
            stats.liveMetrics
          }}</span>
          <span class="text-xs text-muted">values in memory</span>
        </div>

        <div
          class="rounded-lg border p-4 flex flex-col gap-1.5 transition-colors"
          :class="
            isConnected
              ? 'border-success-500/40 bg-success-500/5'
              : 'border-default bg-elevated/30'
          "
        >
          <div
            class="flex items-center gap-2"
            :class="isConnected ? 'text-success-400' : 'text-muted'"
          >
            <UIcon
              :name="signalIcon"
              class="size-4"
              :class="isConnected && 'animate-pulse'"
            />
            <span class="text-xs uppercase tracking-wider">SignalR</span>
          </div>
          <span
            class="text-3xl font-mono font-bold"
            :class="isConnected ? 'text-success-400' : 'text-muted'"
          >
            {{ isConnected ? "Live" : "Off" }}
          </span>
          <span class="text-xs text-muted">{{
            isConnected ? "streaming" : "not connected"
          }}</span>
        </div>
      </div>

      <!-- Device grid -->
      <div v-if="pending" class="grid grid-cols-3 gap-3">
        <div
          v-for="i in 6"
          :key="i"
          class="rounded-lg border border-default bg-elevated/30 p-4 h-36 animate-pulse"
        />
      </div>

      <div
        v-else-if="devices.length === 0"
        class="flex-1 flex items-center justify-center"
      >
        <span class="text-muted text-sm">No devices registered</span>
      </div>

      <div v-else class="grid grid-cols-3 gap-3">
        <NuxtLink
          v-for="device in devices"
          :key="device.id"
          :to="`/devices/${device.id}`"
          class="group rounded-lg border border-default bg-elevated/30 p-4 flex flex-col gap-3 hover:border-tertiary/40 hover:bg-elevated/60 transition-colors"
        >
          <!-- Device header -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="shrink-0 size-2 rounded-full"
                :class="
                  device.isActive
                    ? 'bg-success-500 shadow-[0_0_5px_var(--color-success-500)]'
                    : 'bg-neutral-600'
                "
              />
              <span class="font-mono font-bold text-sm truncate">{{
                device.name
              }}</span>
            </div>
            <UBadge
              variant="outline"
              color="neutral"
              size="xs"
              class="shrink-0 font-mono tabular-nums"
            >
              {{ device.totalTags }}
            </UBadge>
          </div>

          <!-- Address -->
          <div
            v-if="device.ipAddress"
            class="flex items-center gap-1.5 text-xs text-muted"
          >
            <UIcon :name="gatewayIcon" class="size-3 shrink-0" />
            <span class="font-mono"
              >{{ device.ipAddress }}:{{ device.port }}</span
            >
            <span class="ml-1">
              <UIcon :name="plugIcon" class="size-3" />
              Slave {{ device.slaveId }}
            </span>
          </div>

          <!-- Tag preview -->
          <div
            v-if="device.tags?.length"
            class="flex flex-col gap-1 border-t border-default/50 pt-2"
          >
            <div
              v-for="tag in device.tags"
              :key="tag.tagId"
              class="flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <span
                  v-if="tag.dataType"
                  class="size-1.5 rounded-full shrink-0"
                  :class="TYPE_DOT[tag.dataType]"
                />
                <span class="text-[11px] font-mono text-muted truncate">
                  {{ tag.name ?? tag.slug ?? `P${tag.portNumber}` }}
                </span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span
                  class="text-[11px] font-mono tabular-nums"
                  :class="
                    getMetricValue(tag.tagId) != null
                      ? 'text-default'
                      : 'text-muted/40'
                  "
                >
                  {{ getMetricValue(tag.tagId) ?? "—" }}
                </span>
                <span
                  v-if="tag.unit"
                  class="text-[10px] text-muted uppercase"
                  >{{ tag.unit }}</span
                >
              </div>
            </div>

            <span
              v-if="(device.totalTags ?? 0) > (device.tags?.length ?? 0)"
              class="text-[10px] text-muted/50 mt-0.5"
            >
              +{{ (device.totalTags ?? 0) - (device.tags?.length ?? 0) }}
              more
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
