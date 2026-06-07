<script lang="ts" setup>
import { AreaChart, CurveType } from "vue-chrts";

/**
 * Минималистичный трендовый график без осей, сетки и легенды.
 * Питается кольцевым буфером live-значений из realtime-store — отрисовывает
 * форму сигнала за сессию прямо в карточке тега, не обращаясь к API истории.
 */
const props = withDefaults(
  defineProps<{
    /** Последовательность значений (старые → новые). */
    values: number[];
    color?: string;
    height?: number;
  }>(),
  {
    color: "var(--color-info-500)",
    height: 32,
  },
);

interface Point {
  value: number;
}

const data = computed<Point[]>(() => props.values.map((value) => ({ value })));

// Жёсткий домен с микро-отступом: ровная линия не схлопывается в край и
// не «прыгает» по высоте при добавлении точек.
const yDomain = computed<[number, number]>(() => {
  if (props.values.length === 0) return [0, 1];
  let lo = Math.min(...props.values);
  let hi = Math.max(...props.values);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.1;
  return [lo - pad, hi + pad];
});

const categories = computed(() => ({
  value: { name: "value", color: props.color },
}));

const gradientStops = [
  { offset: "0%", stopOpacity: 0.3 },
  { offset: "100%", stopOpacity: 0 },
];

const PAD = { top: 2, right: 0, bottom: 2, left: 0 };
</script>

<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <AreaChart
      v-if="data.length > 1"
      :data="data"
      :categories="categories"
      :height="height"
      :padding="PAD"
      :y-domain="yDomain"
      :curve-type="CurveType.MonotoneX"
      :gradient-stops="gradientStops"
      :line-width="1.5"
      hide-x-axis
      hide-y-axis
      hide-legend
      hide-tooltip
    />
    <div
      v-else
      class="flex h-full items-center justify-center text-[10px] text-muted/40"
    >
      —
    </div>
  </div>
</template>
