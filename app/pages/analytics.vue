<script lang="ts" setup>
import { chartIcon, reloadIcon, tagIcon } from "~/core/icons-map";
import { TAG_TYPE_COLOR } from "~/types/models";
import { digitalLabel, thresholdLines } from "~/utils/tagStatus";

definePageMeta({
  title: "Analytics",
  description: "Tag metrics history charts",
});

const api = useApi();

const { data: tagsList } = useAsyncData("tags-select", () => api.tags.list());

const tags = computed(() => tagsList.value ?? []);

const RANGES = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "30d", hours: 720 },
] as const;

const selectedTagId = ref<number | undefined>(undefined);
const selectedRange = ref<(typeof RANGES)[number]>(RANGES[2]);

const selectedTag = computed(
  () => tags.value.find((s) => s.tagId === selectedTagId.value) ?? null,
);

const ui = computed(() => selectedTag.value?.uiConfigJson ?? null);
const isDigital = computed(() => selectedTag.value?.dataType === "DIGITAL");
const thresholds = computed(() => (isDigital.value ? [] : thresholdLines(ui.value)));

const tagColor = computed(() =>
  selectedTag.value?.dataType
    ? `var(--color-${TAG_TYPE_COLOR[selectedTag.value.dataType]}-500)`
    : "var(--color-info-500)",
);

const pending = ref(false);
const points = ref<[number, number][]>([]);

// Границы запрошенного окна. Без них график растягивал бы редкие точки
// (deadband прореживает данные) на всю ширину, и ось времени врала бы:
// выбранные «24h» могли отображать произвольный кусок времени.
const windowFrom = ref(0);
const windowTo = ref(0);

const fetchHistory = async () => {
  const id = selectedTagId.value;
  if (!id) return;

  const to = new Date();
  const from = new Date(to.getTime() - selectedRange.value.hours * 3_600_000);
  windowFrom.value = from.getTime();
  windowTo.value = to.getTime();

  pending.value = true;
  try {
    const raw = await api.metrics.getHistory({
      tagId: id,
      from: from.toISOString(),
      to: to.toISOString(),
    });
    points.value = (raw as unknown as [number, number][]) ?? [];
  } finally {
    pending.value = false;
  }
};

// Высота графика — от фактической высоты контейнера (а не фикс. 400px):
// заполняет экран и корректно пересчитывается при переключении ширины (useLayout).
const chartBox = ref<HTMLElement | null>(null);
const { height: boxHeight } = useElementSize(chartBox);
const chartHeight = computed(() =>
  Math.max(280, Math.floor(boxHeight.value || 0)),
);

// Сводная статистика по выборке — для информативности шапки графика.
const stats = computed(() => {
  const pts = points.value;
  if (pts.length === 0) return null;

  const last = pts[pts.length - 1]![1];

  if (isDigital.value) {
    // Для дискретных min/max/avg бессмысленны — считаем переключения.
    let switches = 0;
    for (let i = 1; i < pts.length; i++) {
      if ((pts[i]![1] >= 0.5) !== (pts[i - 1]![1] >= 0.5)) switches++;
    }
    return { last, lastLabel: digitalLabel(last, ui.value), switches };
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const [, v] of pts) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { last, min, max, avg: sum / pts.length };
});

const fmt = (v: number | undefined) => {
  if (v == null || isNaN(v)) return "—";
  const abs = Math.abs(v);
  if (abs !== 0 && (abs >= 1e4 || abs < 1e-2)) return v.toExponential(1);
  return Number(v.toFixed(2)).toString();
};

watch(
  [selectedTagId, selectedRange],
  () => {
    if (selectedTagId.value) fetchHistory();
  },
  { immediate: false },
);

const tagSelectItems = computed(() =>
  tags.value.map((s) => ({
    label: s.name ?? s.slug ?? `Tag ${s.tagId}`,
    value: s.tagId,
  })),
);
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-3 px-4 py-3 border-b border-default shrink-0 flex-wrap"
    >
      <span class="font-mono font-semibold text-sm shrink-0">Analytics</span>
      <USeparator orientation="vertical" class="h-5" />
      <!-- Tag select -->
      <div class="flex items-center gap-2 min-w-56">
        <UIcon :name="tagIcon" class="size-4 text-muted shrink-0" />
        <USelect
          v-model="selectedTagId"
          :items="tagSelectItems"
          placeholder="Select tag…"
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
          @click="() => { selectedRange = r }"
        />
      </div>

      <UButton
        :icon="reloadIcon"
        variant="ghost"
        color="neutral"
        size="sm"
        :disabled="pending || !selectedTagId"
        @click="fetchHistory"
      />

      <!-- Tag meta -->
      <div v-if="selectedTag" class="ml-auto flex items-center gap-2">
        <UBadge
          v-if="selectedTag.dataType"
          :color="TAG_TYPE_COLOR[selectedTag.dataType]"
          :label="selectedTag.dataType"
          variant="subtle"
          size="sm"
        />
        <span class="text-xs text-muted font-mono">{{
          selectedTag.unit || "—"
        }}</span>
        <span class="text-xs text-muted">{{ points.length }} points</span>
      </div>
    </div>

    <!-- Chart area -->
    <div class="flex-1 min-h-0 overflow-hidden p-4 flex flex-col">
      <!-- Empty state -->
      <div
        v-if="!selectedTagId"
        class="flex-1 flex flex-col items-center justify-center gap-3 text-muted"
      >
        <UIcon :name="chartIcon" class="size-12 opacity-20" />
        <span class="text-sm">Select a tag to view history</span>
      </div>

      <!-- Loading -->
      <div v-else-if="pending" class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center gap-2 text-muted">
          <div
            class="size-6 border-2 border-current border-t-transparent rounded-full animate-spin"
          />
          <span class="text-xs">Loading…</span>
        </div>
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
      <div v-else class="flex-1 min-h-0 flex flex-col gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-sm font-mono font-semibold">{{
            selectedTag?.name
          }}</span>
          <span class="text-xs text-muted"
            >· last {{ selectedRange.label }}</span
          >

          <!-- Сводка по выборке -->
          <div
            v-if="stats"
            class="ml-auto flex items-center gap-3 text-xs font-mono"
          >
            <template v-if="isDigital && 'lastLabel' in stats">
              <span>
                <span class="text-muted">now</span>
                {{ stats.lastLabel }}
              </span>
              <span>
                <span class="text-muted">switches</span>
                {{ stats.switches }}
              </span>
            </template>
            <template v-else-if="'min' in stats">
              <span>
                <span class="text-muted">last</span>
                {{ fmt(stats.last) }}
              </span>
              <span>
                <span class="text-muted">min</span>
                {{ fmt(stats.min) }}
              </span>
              <span>
                <span class="text-muted">max</span>
                {{ fmt(stats.max) }}
              </span>
              <span>
                <span class="text-muted">avg</span>
                {{ fmt(stats.avg) }}
              </span>
              <span class="text-muted">{{ selectedTag?.unit || "" }}</span>
            </template>
          </div>
        </div>
        <div ref="chartBox" class="flex-1 min-h-0">
          <ChartsMetricChart
            :points="points"
            :from="windowFrom"
            :to="windowTo"
            :unit="selectedTag?.unit ?? ''"
            :color="tagColor"
            :range-hours="selectedRange.hours"
            :thresholds="thresholds"
            :digital="isDigital"
            :height="chartHeight"
          />
        </div>
      </div>
    </div>
  </div>
</template>
