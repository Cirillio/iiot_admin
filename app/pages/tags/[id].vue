<script lang="ts" setup>
import {
  arrowLeftIcon,
  binaryIcon,
  chartIcon,
  hashIcon,
  reloadIcon,
  viewCardsIcon,
  viewTableIcon,
} from "~/core/icons-map";
import { TAG_TYPE_COLOR } from "~/types/models";

definePageMeta({
  title: "Tag",
  description: "Tag detail, live value and metrics history",
});

const api = useApi();
const route = useRoute();
const rt = useRealTimeStore();

const tagId = Number(route.params.id);

const { data: tag, pending, refresh } = useAsyncData(
  `tag-${tagId}`,
  () => api.tags.getById(tagId),
  { immediate: true },
);

const { data: devicesData } = useAsyncData("devices-for-filter", () =>
  api.devices.list(),
);

const deviceName = computed(
  () =>
    devicesData.value?.find((d) => d.id === tag.value?.deviceId)?.name ?? null,
);

const tagColor = computed(() =>
  tag.value?.dataType
    ? `var(--color-${TAG_TYPE_COLOR[tag.value.dataType]}-500)`
    : "var(--color-info-500)",
);

const isDigital = computed(() => tag.value?.dataType === "DIGITAL");

// --- Live value (SignalR) ---

const liveMetric = computed(() => rt.getMetricByTagId(tagId));

const liveDisplay = computed(() => {
  const v = liveMetric.value?.value;
  if (v == null) return null;
  if (isDigital.value) return v >= 0.5 ? "ON" : "OFF";
  return Number(v).toFixed(2);
});

// --- History ---

const RANGES = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "30d", hours: 720 },
] as const;

const selectedRange = ref<(typeof RANGES)[number]>(RANGES[2]);
const historyPending = ref(false);
const points = ref<[number, number][]>([]);

type ViewMode = "chart" | "table";
const viewMode = ref<ViewMode>("chart");

const fetchHistory = async () => {
  const to = new Date();
  const from = new Date(to.getTime() - selectedRange.value.hours * 3_600_000);
  historyPending.value = true;
  try {
    const raw = await api.metrics.getHistory({
      tagId,
      from: from.toISOString(),
      to: to.toISOString(),
    });
    points.value = (raw as unknown as [number, number][]) ?? [];
  } finally {
    historyPending.value = false;
  }
};

watch(selectedRange, fetchHistory);
onMounted(fetchHistory);

// Newest-first rows for table view
const tableRows = computed(() =>
  [...points.value].reverse().map(([t, value]) => ({ t, value })),
);

const formatTs = (t: number) =>
  new Date(t).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatVal = (v: number) =>
  isDigital.value ? (v >= 0.5 ? "1" : "0") : Number(v).toFixed(3);

const formatDate = (s?: string) =>
  s ? new Date(s).toLocaleString("ru-RU") : "—";

const tableColumns = [
  { accessorKey: "t", header: "Time" },
  { accessorKey: "value", header: "Value" },
];
</script>

<template>
  <div class="flex flex-col size-full overflow-hidden">
    <!-- Nav -->
    <div
      class="flex items-center justify-between px-3 py-2.5 border-b border-default shrink-0"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UButton
          :icon="arrowLeftIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          to="/tags"
        />
        <div class="flex flex-col min-w-0">
          <h1 class="text-xl font-bold font-mono leading-tight truncate">
            {{ tag?.name ?? "—" }}
          </h1>
          <span class="text-xs font-mono text-muted truncate">{{
            tag?.slug ?? "—"
          }}</span>
        </div>
        <UBadge
          v-if="tag?.dataType"
          :color="TAG_TYPE_COLOR[tag.dataType]"
          variant="subtle"
          size="sm"
          class="font-mono"
        >
          {{ tag.dataType.replace(/_/g, " ") }}
        </UBadge>
      </div>

      <div class="flex items-center gap-1">
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="pending || historyPending"
          @click="refresh(); fetchHistory()"
        />
        <UBadge
          :color="rt.isConnected ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
          class="font-mono uppercase tracking-widest"
          :class="rt.isConnected ? 'animate-pulse' : ''"
        >
          {{ rt.isConnected ? "live" : "offline" }}
        </UBadge>
      </div>
    </div>

    <div class="flex h-full min-h-0">
      <!-- Left: history -->
      <div class="flex-3 min-w-0 h-full min-h-0 flex flex-col">
        <div
          class="flex items-center gap-2 px-4 py-2.5 border-b border-default flex-wrap"
        >
          <UIcon :name="chartIcon" class="size-5 text-muted" />
          <span class="text-base font-semibold">History</span>
          <UBadge color="neutral" variant="outline" size="sm" class="font-mono">
            {{ points.length }}
          </UBadge>

          <div class="flex gap-1 ml-2">
            <UButton
              v-for="r in RANGES"
              :key="r.label"
              :label="r.label"
              size="xs"
              :variant="selectedRange === r ? 'solid' : 'outline'"
              :color="selectedRange === r ? 'primary' : 'neutral'"
              @click="selectedRange = r"
            />
          </div>

          <div class="flex items-center gap-1 ml-auto">
            <UButton
              :icon="viewCardsIcon"
              size="xs"
              variant="ghost"
              :color="viewMode === 'chart' ? 'primary' : 'neutral'"
              @click="viewMode = 'chart'"
            />
            <UButton
              :icon="viewTableIcon"
              size="xs"
              variant="ghost"
              :color="viewMode === 'table' ? 'primary' : 'neutral'"
              @click="viewMode = 'table'"
            />
          </div>
        </div>

        <div class="flex-1 min-h-0 overflow-hidden p-4 flex flex-col">
          <!-- Loading -->
          <div
            v-if="historyPending"
            class="flex-1 flex items-center justify-center text-muted"
          >
            <div
              class="size-6 border-2 border-current border-t-transparent rounded-full animate-spin"
            />
          </div>

          <!-- No data -->
          <div
            v-else-if="points.length === 0"
            class="flex-1 flex flex-col items-center justify-center gap-2 text-muted"
          >
            <UIcon :name="chartIcon" class="size-10 opacity-20" />
            <span class="text-sm">No data for selected range</span>
          </div>

          <!-- Chart -->
          <div v-else-if="viewMode === 'chart'" class="flex-1 min-h-0">
            <ChartsMetricChart
              :points="points"
              :unit="tag?.unit ?? ''"
              :color="tagColor"
              :range-hours="selectedRange.hours"
              :height="420"
            />
          </div>

          <!-- Table -->
          <div v-else class="flex-1 min-h-0 overflow-y-auto">
            <UTable
              :data="tableRows"
              :columns="tableColumns"
              class="w-full"
              sticky
            >
              <template #t-cell="{ row }">
                <span class="font-mono text-xs text-muted">{{
                  formatTs(row.original.t)
                }}</span>
              </template>
              <template #value-cell="{ row }">
                <span class="font-mono text-sm tabular-nums">{{
                  formatVal(row.original.value)
                }}</span>
                <span v-if="tag?.unit" class="text-xs text-muted ml-1">{{
                  tag.unit
                }}</span>
              </template>
            </UTable>
          </div>
        </div>
      </div>

      <!-- Right: details -->
      <div
        class="flex-1 min-h-0 border-l border-default overflow-y-auto p-4 flex flex-col gap-5"
      >
        <!-- Live value -->
        <div
          class="rounded-lg border border-default bg-elevated/30 p-4 flex flex-col gap-1"
        >
          <span class="text-xs uppercase tracking-widest text-muted"
            >Live value</span
          >
          <div class="flex items-baseline gap-2">
            <span
              class="text-4xl font-mono font-bold tabular-nums"
              :style="{ color: liveDisplay != null ? tagColor : undefined }"
              :class="liveDisplay == null ? 'text-muted/30' : ''"
            >
              {{ liveDisplay ?? "—" }}
            </span>
            <span
              v-if="tag?.unit && !isDigital"
              class="text-sm text-muted uppercase font-mono"
              >{{ tag.unit }}</span
            >
          </div>
          <div class="flex items-center gap-3 text-xs text-muted font-mono pt-1">
            <span v-if="liveMetric?.rawValue != null"
              >raw: {{ liveMetric.rawValue }}</span
            >
            <span v-if="liveMetric?.time">{{ formatTs(new Date(liveMetric.time).getTime()) }}</span>
            <span v-else>no live data</span>
          </div>
        </div>

        <!-- Identity -->
        <section class="flex flex-col gap-2">
          <span
            class="text-sm font-semibold uppercase tracking-widest text-default/80 border-b border-default pb-1"
            >Identity</span
          >
          <div class="grid grid-cols-2 gap-y-1.5 text-sm font-mono">
            <span class="text-muted flex items-center gap-1"
              ><UIcon :name="hashIcon" class="size-3.5" /> Tag ID</span
            >
            <span class="text-end">{{ tag?.tagId ?? "—" }}</span>
            <span class="text-muted">Device</span>
            <span class="text-end truncate">{{ deviceName ?? tag?.deviceId ?? "—" }}</span>
            <span class="text-muted">Port</span>
            <span class="text-end">{{ tag?.portNumber ?? "—" }}</span>
            <span class="text-muted">Updated</span>
            <span class="text-end text-xs">{{ formatDate(tag?.updatedAt) }}</span>
          </div>
        </section>

        <!-- Modbus -->
        <section class="flex flex-col gap-2">
          <span
            class="text-sm font-semibold uppercase tracking-widest text-default/80 border-b border-default pb-1 flex items-center gap-1"
            ><UIcon :name="binaryIcon" class="size-3.5" /> Modbus</span
          >
          <div class="grid grid-cols-2 gap-y-1.5 text-sm font-mono">
            <span class="text-muted">Register addr</span>
            <span class="text-end">{{ tag?.registerAddress ?? "—" }}</span>
            <span class="text-muted">Register type</span>
            <span class="text-end">{{ tag?.registerType?.replace(/_/g, " ") ?? "—" }}</span>
            <span class="text-muted">Register count</span>
            <span class="text-end">{{ tag?.registerCount ?? "—" }}</span>
            <span class="text-muted">Endianness</span>
            <span class="text-end">{{ tag?.endianness?.replace(/_/g, " ") ?? "—" }}</span>
          </div>
        </section>

        <!-- Scaling -->
        <section class="flex flex-col gap-2">
          <span
            class="text-sm font-semibold uppercase tracking-widest text-default/80 border-b border-default pb-1"
            >Scaling</span
          >
          <div class="grid grid-cols-2 gap-y-1.5 text-sm font-mono">
            <span class="text-muted">Input range</span>
            <span class="text-end">{{ tag?.inputMin ?? "—" }} … {{ tag?.inputMax ?? "—" }}</span>
            <span class="text-muted">Output range</span>
            <span class="text-end">{{ tag?.outputMin ?? "—" }} … {{ tag?.outputMax ?? "—" }}</span>
            <span class="text-muted">Offset</span>
            <span class="text-end">{{ tag?.offsetVal ?? "—" }}</span>
            <span class="text-muted">Deadband</span>
            <span class="text-end">{{ tag?.deadbandThreshold ?? "—" }}</span>
            <span v-if="tag?.formula" class="text-muted">Formula</span>
            <span v-if="tag?.formula" class="text-end truncate">{{ tag.formula }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
