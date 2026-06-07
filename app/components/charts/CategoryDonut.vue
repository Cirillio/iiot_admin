<script lang="ts" setup>
import { DonutChart } from "vue-chrts";

/** Один сегмент кольцевой диаграммы. */
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Кольцевая диаграмма распределения по категориям (доли от целого).
 * Обёртка над vue-chrts DonutChart: принимает готовые сегменты и
 * раскладывает их в параллельные массивы data/categories, которых ждёт библиотека.
 */
const props = withDefaults(
  defineProps<{
    segments: DonutSegment[];
    height?: number;
    radius?: number;
    arcWidth?: number;
  }>(),
  {
    height: 180,
    radius: 80,
    arcWidth: 22,
  },
);

// Пустые сегменты отбрасываем — нулевой сектор только мусорит легенду.
const visible = computed(() => props.segments.filter((s) => s.value > 0));

const data = computed<number[]>(() => visible.value.map((s) => s.value));

const categories = computed(() =>
  Object.fromEntries(
    visible.value.map((s, i) => [`seg${i}`, { name: s.label, color: s.color }]),
  ),
);

const total = computed(() =>
  visible.value.reduce((acc, s) => acc + s.value, 0),
);
</script>

<template>
  <div class="flex w-full items-center justify-center">
    <DonutChart
      v-if="total > 0"
      :data="data"
      :categories="categories"
      :height="height"
      :radius="radius"
      :arc-width="arcWidth"
      :pad-angle="0.02"
    />
    <div
      v-else
      class="flex items-center justify-center text-xs text-muted"
      :style="{ height: `${height}px` }"
    >
      No data
    </div>
  </div>
</template>
