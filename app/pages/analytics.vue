<script lang="ts" setup>
import { LineChart } from "vue-chrts";
import { chartIcon, reloadIcon, sensorIcon } from "~/core/icons-map";
import { SENSOR_TYPE_COLOR } from "~/types/models";

definePageMeta({
  title: "Analytics",
  description: "Sensor metrics history charts",
});

const api = useApi();

const { data: sensorsList } = useAsyncData("sensors-select", () => api.sensors.list());

const sensors = computed(() => sensorsList.value ?? []);

const RANGES = [
  { label: "1h",  hours: 1 },
  { label: "6h",  hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d",  hours: 168 },
  { label: "30d", hours: 720 },
] as const;

const selectedSensorId = ref<number | null>(null);
const selectedRange = ref<(typeof RANGES)[number]>(RANGES[2]);

const selectedSensor = computed(() =>
  sensors.value.find((s) => s.sensorId === selectedSensorId.value) ?? null,
);

const pending = ref(false);
const chartTimestamps = ref<number[]>([]);
const chartData = ref<{ t: number; value: number }[]>([]);

const fetchHistory = async () => {
  const id = selectedSensorId.value;
  if (!id) return;

  const to = new Date();
  const from = new Date(to.getTime() - selectedRange.value.hours * 3_600_000);

  pending.value = true;
  try {
    const raw = await api.metrics.getHistory({
      sensorId: id,
      from: from.toISOString(),
      to: to.toISOString(),
    });

    const points = (raw as unknown as [number, number][]) ?? [];
    chartTimestamps.value = points.map(([ts]) => ts);
    chartData.value = points.map(([ts, val]) => ({ t: ts, value: val }));
  } finally {
    pending.value = false;
  }
};

watch([selectedSensorId, selectedRange], () => {
  if (selectedSensorId.value) fetchHistory();
}, { immediate: false });

const categories = computed(() => ({
  value: {
    name: selectedSensor.value?.name ?? "Value",
    color: selectedSensor.value?.dataType
      ? `var(--color-${SENSOR_TYPE_COLOR[selectedSensor.value.dataType]}-500)`
      : "var(--color-info-500)",
  },
}));

const xFormatter = (i: number) => {
  const ts = chartTimestamps.value[i];
  if (!ts) return "";
  const d = new Date(ts);
  return selectedRange.value.hours <= 24
    ? d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const sensorSelectItems = computed(() =>
  sensors.value.map((s) => ({
    label: s.name ?? s.slug ?? `Sensor ${s.sensorId}`,
    value: s.sensorId,
  })),
);
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">

    <!-- Toolbar -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-default shrink-0 flex-wrap">
      <!-- Sensor select -->
      <div class="flex items-center gap-2 min-w-56">
        <UIcon :name="sensorIcon" class="size-4 text-muted shrink-0" />
        <USelect
          v-model="selectedSensorId"
          :items="sensorSelectItems"
          placeholder="Select sensor…"
          value-key="value"
          class="w-full"
        />
      </div>

      <!-- Range buttons -->
      <div class="flex gap-1">
        <UButton
          v-for="r in RANGES"
          :key="r.label"
          :label="r.label"
          size="sm"
          :variant="selectedRange === r ? 'solid' : 'outline'"
          :color="selectedRange === r ? 'primary' : 'neutral'"
          @click="selectedRange = r"
        />
      </div>

      <UButton
        :icon="reloadIcon"
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="pending || !selectedSensorId"
        @click="fetchHistory"
      />

      <!-- Sensor meta -->
      <div v-if="selectedSensor" class="ml-auto flex items-center gap-2">
        <UBadge
          v-if="selectedSensor.dataType"
          :color="SENSOR_TYPE_COLOR[selectedSensor.dataType]"
          :label="selectedSensor.dataType"
          variant="subtle"
          size="sm"
        />
        <span class="text-xs text-muted font-mono">{{ selectedSensor.unit || "—" }}</span>
        <span class="text-xs text-muted">{{ chartData.length }} points</span>
      </div>
    </div>

    <!-- Chart area -->
    <div class="flex-1 min-h-0 overflow-hidden p-4 flex flex-col">
      <!-- Empty state -->
      <div v-if="!selectedSensorId" class="flex-1 flex flex-col items-center justify-center gap-3 text-muted">
        <UIcon :name="chartIcon" class="size-12 opacity-20" />
        <span class="text-sm">Select a sensor to view history</span>
      </div>

      <!-- Loading -->
      <div v-else-if="pending" class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center gap-2 text-muted">
          <div class="size-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span class="text-xs">Loading…</span>
        </div>
      </div>

      <!-- No data -->
      <div v-else-if="chartData.length === 0" class="flex-1 flex flex-col items-center justify-center gap-2 text-muted">
        <UIcon :name="chartIcon" class="size-10 opacity-20" />
        <span class="text-sm">No data for selected range</span>
      </div>

      <!-- Chart -->
      <div v-else class="flex-1 min-h-0 flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-mono font-semibold">{{ selectedSensor?.name }}</span>
          <span class="text-xs text-muted">· last {{ selectedRange.label }}</span>
        </div>
        <div class="flex-1 min-h-0">
          <LineChart
            :data="chartData"
            :categories="categories"
            :height="400"
            :x-formatter="xFormatter"
            :y-label="selectedSensor?.unit ?? ''"
            :curved="true"
          />
        </div>
      </div>
    </div>

  </div>
</template>
