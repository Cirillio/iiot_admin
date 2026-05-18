<script lang="ts" setup>
import {
  activityIcon,
  databaseIcon,
  reloadIcon,
  saveIcon,
  timerIcon,
} from "~/core/icons-map";
import type { SystemConfig } from "~/types/models";

definePageMeta({
  title: "Settings",
  description: "System configuration",
});

const api = useApi();
const toast = useToast();

const { data, pending, refresh } = useAsyncData(
  "system-config",
  () => api.system.getConfig(),
  { immediate: true },
);

const defaults: Omit<SystemConfig, "id" | "updatedAt"> = {
  rawRetentionDays: 7,
  aggRetentionDays: 90,
  pollingIntervalMs: 1000,
  configReloadIntervalSec: 30,
  healthCheckIntervalSec: 60,
  deadbandThreshold: 0.01,
  dataHeartbeatSec: 60,
  uiUpdateIntervalMs: 500,
};

const form = reactive({ ...defaults });
const saved = reactive({ ...defaults });

watch(
  data,
  (cfg) => {
    if (!cfg) return;
    const keys = Object.keys(defaults) as (keyof typeof defaults)[];
    for (const k of keys) {
      const v = cfg[k] ?? defaults[k];
      (form as Record<string, number>)[k] = v as number;
      (saved as Record<string, number>)[k] = v as number;
    }
  },
  { immediate: true },
);

const dirtyCount = computed(() => {
  return (Object.keys(defaults) as (keyof typeof defaults)[]).filter(
    (k) => form[k] !== saved[k],
  ).length;
});

const saving = ref(false);

const handleSave = async () => {
  saving.value = true;
  try {
    await api.system.updateConfig({ id: data.value?.id, ...form });
    await refresh();
    toast.add({ title: "Configuration saved", color: "success" });
  } catch {
    toast.add({ title: "Failed to save configuration", color: "error" });
  } finally {
    saving.value = false;
  }
};

const formatDate = (s?: string) =>
  s ? new Date(s).toLocaleString("ru-RU") : "—";
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-default shrink-0">
      <div class="flex items-center gap-2">
        <span class="font-mono font-semibold text-sm">Settings</span>
        <span v-if="data?.updatedAt" class="text-xs text-muted/50 font-mono">
          · saved {{ formatDate(data.updatedAt) }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="pending"
          @click="refresh()"
        />
        <UButton
          :leading-icon="saveIcon"
          size="sm"
          :loading="saving"
          :disabled="pending"
          @click="handleSave"
        >
          <span>Save</span>
          <span
            v-if="dirtyCount > 0"
            class="ml-1 size-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center leading-none"
          >{{ dirtyCount }}</span>
        </UButton>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-auto p-4">
      <div class="max-w-2xl flex flex-col gap-8">

        <!-- Data Retention -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center gap-2 pb-2 border-b border-default">
            <UIcon :name="databaseIcon" class="size-3.5 text-muted" />
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Data Retention</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <SettingsSettingCard
              :icon="databaseIcon"
              label="Raw retention"
              description="Days to keep raw metrics in the database"
              unit="days"
              :min="1"
              :model-value="form.rawRetentionDays"
              :saved-value="saved.rawRetentionDays"
              @update:model-value="form.rawRetentionDays = $event"
            />
            <SettingsSettingCard
              :icon="databaseIcon"
              label="Aggregated retention"
              description="Days to keep hourly aggregated data"
              unit="days"
              :min="1"
              :model-value="form.aggRetentionDays"
              :saved-value="saved.aggRetentionDays"
              @update:model-value="form.aggRetentionDays = $event"
            />
          </div>
        </section>

        <!-- Polling -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center gap-2 pb-2 border-b border-default">
            <UIcon :name="timerIcon" class="size-3.5 text-muted" />
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Polling</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <SettingsSettingCard
              :icon="timerIcon"
              label="Polling interval"
              description="How often sensors are read from hardware"
              unit="ms"
              :min="100"
              :model-value="form.pollingIntervalMs"
              :saved-value="saved.pollingIntervalMs"
              @update:model-value="form.pollingIntervalMs = $event"
            />
            <SettingsSettingCard
              :icon="reloadIcon"
              label="Config reload"
              description="How often config is reloaded from database"
              unit="sec"
              :min="5"
              :model-value="form.configReloadIntervalSec"
              :saved-value="saved.configReloadIntervalSec"
              @update:model-value="form.configReloadIntervalSec = $event"
            />
          </div>
        </section>

        <!-- Monitoring & Data -->
        <section class="flex flex-col gap-3">
          <div class="flex items-center gap-2 pb-2 border-b border-default">
            <UIcon :name="activityIcon" class="size-3.5 text-muted" />
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Monitoring & Data</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <SettingsSettingCard
              :icon="activityIcon"
              label="Health check"
              description="Service health probe frequency"
              unit="sec"
              :min="5"
              :model-value="form.healthCheckIntervalSec"
              :saved-value="saved.healthCheckIntervalSec"
              @update:model-value="form.healthCheckIntervalSec = $event"
            />
            <SettingsSettingCard
              :icon="activityIcon"
              label="Data heartbeat"
              description="Force-write unchanged sensor values"
              unit="sec"
              :min="1"
              :model-value="form.dataHeartbeatSec"
              :saved-value="saved.dataHeartbeatSec"
              @update:model-value="form.dataHeartbeatSec = $event"
            />
            <SettingsSettingCard
              :icon="activityIcon"
              label="Deadband threshold"
              description="Min change required to record a new value"
              :min="0"
              :step="0.001"
              :model-value="form.deadbandThreshold"
              :saved-value="saved.deadbandThreshold"
              @update:model-value="form.deadbandThreshold = $event"
            />
            <SettingsSettingCard
              :icon="timerIcon"
              label="UI update interval"
              description="Frontend metric refresh rate"
              unit="ms"
              :min="100"
              :model-value="form.uiUpdateIntervalMs"
              :saved-value="saved.uiUpdateIntervalMs"
              @update:model-value="form.uiUpdateIntervalMs = $event"
            />
          </div>
        </section>

      </div>
    </div>
  </div>
</template>
