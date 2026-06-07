<script lang="ts" setup>
import { chartIcon, reloadIcon, tagIcon } from "~/core/icons-map";
import { TAG_TYPE_COLOR } from "~/types/models";

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

const tagColor = computed(() =>
  selectedTag.value?.dataType
    ? `var(--color-${TAG_TYPE_COLOR[selectedTag.value.dataType]}-500)`
    : "var(--color-info-500)",
);

const pending = ref(false);
const points = ref<[number, number][]>([]);

const fetchHistory = async () => {
  const id = selectedTagId.value;
  if (!id) return;

  const to = new Date();
  const from = new Date(to.getTime() - selectedRange.value.hours * 3_600_000);

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
          @click="selectedRange = r"
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
        <div class="flex items-center gap-2">
          <span class="text-sm font-mono font-semibold">{{
            selectedTag?.name
          }}</span>
          <span class="text-xs text-muted"
            >· last {{ selectedRange.label }}</span
          >
        </div>
        <div class="flex-1 min-h-0">
          <ChartsMetricChart
            :points="points"
            :unit="selectedTag?.unit ?? ''"
            :color="tagColor"
            :range-hours="selectedRange.hours"
            :height="400"
          />
        </div>
      </div>
    </div>
  </div>
</template>
