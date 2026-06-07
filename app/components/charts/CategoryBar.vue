<script lang="ts" setup>
import { BarChart } from "vue-chrts";

/** Одна категория столбчатой диаграммы. */
export interface BarItem {
  label: string;
  value: number;
}

/**
 * Столбчатая диаграмма сравнения значений по категориям.
 * Обёртка над vue-chrts BarChart с единственной серией (yAxis=value, xAxis=label).
 */
const props = withDefaults(
  defineProps<{
    items: BarItem[];
    /** Подпись серии в тултипе. */
    seriesName?: string;
    color?: string;
    height?: number;
  }>(),
  {
    seriesName: "value",
    color: "var(--color-primary-500)",
    height: 200,
  },
);

const categories = computed(() => ({
  value: { name: props.seriesName, color: props.color },
}));

const yAxis: (keyof BarItem)[] = ["value"];

// Целые тики по Y: количество тегов/устройств — дискретная величина, дробные деления бессмысленны.
const yFormatter = (tick: number) => `${Math.round(tick)}`;
const xFormatter = (i: number) => props.items[i]?.label ?? "";

const PAD = { top: 8, right: 8, bottom: 24, left: 32 };
</script>

<template>
  <div class="w-full" :style="{ height: `${height}px` }">
    <BarChart
      v-if="items.length > 0"
      :data="items"
      :categories="categories"
      :y-axis="yAxis"
      x-axis="label"
      :height="height"
      :padding="PAD"
      :radius="3"
      :bar-padding="0.3"
      :y-formatter="yFormatter"
      :x-formatter="xFormatter"
      :y-grid-line="true"
      hide-legend
    />
    <div
      v-else
      class="flex h-full items-center justify-center text-xs text-muted"
    >
      No data
    </div>
  </div>
</template>
