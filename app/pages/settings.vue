<script lang="ts" setup>
import { reloadIcon, saveIcon } from "~/core/icons-map";
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

const form = reactive<Omit<SystemConfig, "id" | "updatedAt">>({
  rawRetentionDays: 7,
  aggRetentionDays: 90,
  pollingIntervalMs: 1000,
  configReloadIntervalSec: 30,
  healthCheckIntervalSec: 60,
  deadbandThreshold: 0.01,
  dataHeartbeatSec: 60,
  uiUpdateIntervalMs: 500,
});

watch(
  data,
  (cfg) => {
    if (!cfg) return;
    form.rawRetentionDays = cfg.rawRetentionDays ?? form.rawRetentionDays;
    form.aggRetentionDays = cfg.aggRetentionDays ?? form.aggRetentionDays;
    form.pollingIntervalMs = cfg.pollingIntervalMs ?? form.pollingIntervalMs;
    form.configReloadIntervalSec = cfg.configReloadIntervalSec ?? form.configReloadIntervalSec;
    form.healthCheckIntervalSec = cfg.healthCheckIntervalSec ?? form.healthCheckIntervalSec;
    form.deadbandThreshold = cfg.deadbandThreshold ?? form.deadbandThreshold;
    form.dataHeartbeatSec = cfg.dataHeartbeatSec ?? form.dataHeartbeatSec;
    form.uiUpdateIntervalMs = cfg.uiUpdateIntervalMs ?? form.uiUpdateIntervalMs;
  },
  { immediate: true },
);

const saving = ref(false);

const handleSave = async () => {
  saving.value = true;
  try {
    await api.system.updateConfig({ ...form });
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
        <span class="text-sm text-muted font-mono">System Config</span>
        <span v-if="data?.updatedAt" class="text-xs text-muted/60">
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
          label="Save"
          size="sm"
          :loading="saving"
          :disabled="pending"
          @click="handleSave"
        />
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-auto p-4">
      <div class="max-w-2xl flex flex-col gap-6">

        <!-- Retention -->
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2 pb-2 border-b border-default">
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Data Retention</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Raw data retention"
              description="Days to keep raw metrics"
            >
              <UInput v-model="form.rawRetentionDays" type="number" min="1" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">days</span>
                </template>
              </UInput>
            </UFormField>
            <UFormField
              label="Aggregated retention"
              description="Days to keep hourly aggregates"
            >
              <UInput v-model="form.aggRetentionDays" type="number" min="1" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">days</span>
                </template>
              </UInput>
            </UFormField>
          </div>
        </section>

        <!-- Polling -->
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2 pb-2 border-b border-default">
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Polling</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Polling interval"
              description="How often to read sensors"
            >
              <UInput v-model="form.pollingIntervalMs" type="number" min="100" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">ms</span>
                </template>
              </UInput>
            </UFormField>
            <UFormField
              label="Config reload interval"
              description="How often to reload config from DB"
            >
              <UInput v-model="form.configReloadIntervalSec" type="number" min="5" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">sec</span>
                </template>
              </UInput>
            </UFormField>
          </div>
        </section>

        <!-- Monitoring & Data -->
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2 pb-2 border-b border-default">
            <span class="text-xs font-semibold uppercase tracking-widest text-muted">Monitoring & Data</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Health check interval"
              description="Service health probe frequency"
            >
              <UInput v-model="form.healthCheckIntervalSec" type="number" min="5" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">sec</span>
                </template>
              </UInput>
            </UFormField>
            <UFormField
              label="Data heartbeat"
              description="Force-write unchanged values"
            >
              <UInput v-model="form.dataHeartbeatSec" type="number" min="1" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">sec</span>
                </template>
              </UInput>
            </UFormField>
            <UFormField
              label="Deadband threshold"
              description="Min change to record new value"
            >
              <UInput v-model="form.deadbandThreshold" type="number" step="0.001" min="0" class="w-full" />
            </UFormField>
            <UFormField
              label="UI update interval"
              description="Frontend metric refresh rate"
            >
              <UInput v-model="form.uiUpdateIntervalMs" type="number" min="100" class="w-full">
                <template #trailing>
                  <span class="text-xs text-muted">ms</span>
                </template>
              </UInput>
            </UFormField>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>
