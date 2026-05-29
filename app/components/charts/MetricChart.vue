<script lang="ts" setup>
import { AreaChart, CurveType } from "vue-chrts";

const props = withDefaults(
  defineProps<{
    /** Точки [unix_ms, value], отсортированные по времени */
    points: [number, number][];
    unit?: string;
    /** CSS-цвет линии/градиента */
    color?: string;
    /** Длина окна в часах — определяет формат меток оси X */
    rangeHours?: number;
    height?: number;
  }>(),
  {
    unit: "",
    color: "var(--color-info-500, #3b82f6)",
    rangeHours: 24,
    height: 360,
  },
);

interface Point {
  t: number;
  value: number;
}

const data = computed<Point[]>(() =>
  props.points.map(([t, value]) => ({ t, value })),
);

const categories = computed(() => ({
  value: {
    name: props.unit || "Value",
    color: props.color,
  },
}));

const gradientStops = [
  { offset: "0%", stopOpacity: 0.35 },
  { offset: "100%", stopOpacity: 0 },
];

const formatNum = (v: number) => {
  const abs = Math.abs(v);
  if (abs !== 0 && (abs >= 1e4 || abs < 1e-2)) return v.toExponential(1);
  return Number(v.toFixed(2)).toString();
};

const yFormatter = (tick: number) => formatNum(tick);

const xFormatter = (i: number) => {
  const p = data.value[i];
  if (!p) return "";
  const d = new Date(p.t);
  return props.rangeHours <= 24
    ? d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const tooltipTitleFormatter = (p: Point) =>
  new Date(p.t).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
</script>

<template>
  <AreaChart
    :data="data"
    :categories="categories"
    :height="height"
    :curve-type="CurveType.MonotoneX"
    :gradient-stops="gradientStops"
    :line-width="2"
    :x-formatter="xFormatter"
    :y-formatter="yFormatter"
    :tooltip-title-formatter="tooltipTitleFormatter"
    :y-grid-line="true"
    :x-num-ticks="6"
    :y-num-ticks="5"
    hide-legend
  />
</template>
