<script lang="ts" setup>
import { databaseIcon, reloadIcon, tagIcon } from "~/core/icons-map";
import type { RawMetric } from "~/types/api";

definePageMeta({
  title: "Raw Data",
  description: "Tabular view of raw metrics",
});

const api = useApi();

const { data: tagsList } = useAsyncData("data-tags-select", () =>
  api.tags.list(),
);

const tags = computed(() => tagsList.value ?? []);

const tagSelectItems = computed(() => [
  { label: "All tags", value: undefined as number | undefined },
  ...tags.value.map((t) => ({
    label: t.name ?? t.slug ?? `Tag ${t.tagId}`,
    value: t.tagId,
  })),
]);

const RANGES = [
  { label: "1h", hours: 1 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "All", hours: 0 },
] as const;

const selectedTagId = ref<number | undefined>(undefined);
const selectedRange = ref<(typeof RANGES)[number]>(RANGES[1]);
const page = ref(1);
const pageSize = 50;

const rows = ref<RawMetric[]>([]);
const total = ref(0);
const pending = ref(false);

const fetchPage = async () => {
  pending.value = true;
  try {
    // hours=0 («All») — без временного фильтра; иначе окно от now-hours.
    const from =
      selectedRange.value.hours > 0
        ? new Date(
            Date.now() - selectedRange.value.hours * 3_600_000,
          ).toISOString()
        : undefined;

    const res = await api.metrics.getRaw({
      tagId: selectedTagId.value,
      from,
      page: page.value,
      pageSize,
    });
    rows.value = res.items;
    total.value = res.total;
  } finally {
    pending.value = false;
  }
};

// Смена фильтра сбрасывает на первую страницу; смена страницы — догружает.
watch([selectedTagId, selectedRange], () => {
  page.value = 1;
  fetchPage();
});

watch(page, fetchPage);

onMounted(fetchPage);

const columns = [
  { accessorKey: "time", header: "Time" },
  { accessorKey: "tagName", header: "Tag" },
  { accessorKey: "rawValue", header: "Raw" },
  { accessorKey: "value", header: "Value" },
  { accessorKey: "unit", header: "Unit" },
];

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const fmtNum = (v: number | null | undefined) =>
  v == null ? "—" : Number(v.toFixed(3)).toString();
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex flex-wrap items-center gap-3 border-b border-default px-4 py-3 shrink-0"
    >
      <div class="flex items-center gap-2">
        <UIcon :name="databaseIcon" class="size-4 text-muted" />
        <span class="font-mono text-sm font-semibold">Raw Data</span>
      </div>
      <USeparator orientation="vertical" class="h-5" />

      <div class="flex min-w-52 items-center gap-2">
        <UIcon :name="tagIcon" class="size-4 shrink-0 text-muted" />
        <USelect
          v-model="selectedTagId"
          :items="tagSelectItems"
          value-key="value"
          placeholder="All tags"
          class="w-full"
        />
      </div>

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
        :disabled="pending"
        @click="fetchPage"
      />

      <span class="ml-auto text-xs text-muted">
        {{ total.toLocaleString("ru-RU") }} rows
      </span>
    </div>

    <!-- Table -->
    <div class="min-h-0 flex-1 overflow-auto">
      <UTable
        :data="rows"
        :columns="columns"
        :loading="pending"
        class="w-full"
      >
        <template #time-cell="{ row }">
          <span class="font-mono text-xs tabular-nums">{{
            fmtTime(row.original.time)
          }}</span>
        </template>
        <template #tagName-cell="{ row }">
          <span class="font-mono text-xs">{{
            row.original.tagName ?? `#${row.original.tagId}`
          }}</span>
        </template>
        <template #rawValue-cell="{ row }">
          <span class="font-mono text-xs tabular-nums text-muted">{{
            fmtNum(row.original.rawValue)
          }}</span>
        </template>
        <template #value-cell="{ row }">
          <span class="font-mono text-xs font-semibold tabular-nums">{{
            fmtNum(row.original.value)
          }}</span>
        </template>
        <template #unit-cell="{ row }">
          <span class="text-[10px] uppercase text-muted">{{
            row.original.unit ?? "—"
          }}</span>
        </template>
      </UTable>
    </div>

    <!-- Pagination -->
    <div
      v-if="total > pageSize"
      class="flex items-center justify-between border-t border-default px-4 py-2 shrink-0"
    >
      <span class="text-xs text-muted">
        Page {{ page }} / {{ Math.ceil(total / pageSize) }}
      </span>
      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="pageSize"
        :sibling-count="1"
      />
    </div>
  </div>
</template>
