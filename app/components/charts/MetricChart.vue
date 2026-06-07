<script lang="ts" setup>
import { AreaChart, CurveType } from "vue-chrts";
import { downsampleLTTB } from "~/utils/downsample";
import { STATUS_COLOR, type ThresholdLine } from "~/utils/tagStatus";

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
    /** Горизонтальные линии порогов */
    thresholds?: ThresholdLine[];
    /** Дискретный сигнал — ступенчатая кривая и домен 0..1 */
    digital?: boolean;
  }>(),
  {
    unit: "",
    color: "var(--color-info-500, #3b82f6)",
    rangeHours: 24,
    height: 360,
    thresholds: () => [],
    digital: false,
  },
);

interface Point {
  t: number;
  value: number;
}

// Геометрия области построения фиксирована — иначе нельзя позиционировать оверлей порогов.
const PAD = { top: 8, right: 16, bottom: 24, left: 48 };

const sampled = computed(() => downsampleLTTB(props.points, 600));

const data = computed<Point[]>(() =>
  sampled.value.map(([t, value]) => ({ t, value })),
);

const yDomain = computed<[number, number]>(() => {
  if (props.digital) return [-0.08, 1.08];

  const vals = sampled.value.map((p) => p[1]);
  const thr = props.thresholds.map((t) => t.value);
  const all = [...vals, ...thr];
  if (all.length === 0) return [0, 1];

  let lo = Math.min(...all);
  let hi = Math.max(...all);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.06;
  return [lo - pad, hi + pad];
});

/** Видимые пороги с позицией в процентах по высоте графика. */
const thresholdOverlay = computed(() => {
  const [min, max] = yDomain.value;
  const span = max - min || 1;
  const plotH = props.height - PAD.top - PAD.bottom;
  return props.thresholds
    .filter((t) => t.value >= min && t.value <= max)
    .map((t) => ({
      ...t,
      top: PAD.top + (1 - (t.value - min) / span) * plotH,
      color: STATUS_COLOR[t.level],
    }));
});

const categories = computed(() => ({
  value: { name: props.unit || "Value", color: props.color },
}));

const curveType = computed(() =>
  props.digital ? CurveType.StepAfter : CurveType.MonotoneX,
);

const gradientStops = [
  { offset: "0%", stopOpacity: 0.35 },
  { offset: "100%", stopOpacity: 0 },
];

const formatNum = (v: number) => {
  const abs = Math.abs(v);
  if (abs !== 0 && (abs >= 1e4 || abs < 1e-2)) return v.toExponential(1);
  return Number(v.toFixed(2)).toString();
};

const yFormatter = (tick: number) =>
  props.digital ? (tick >= 0.5 ? "1" : "0") : formatNum(tick);

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
  <div class="relative w-full" :style="{ height: `${height}px` }">
    <AreaChart
      :data="data"
      :categories="categories"
      :height="height"
      :padding="PAD"
      :y-domain="yDomain"
      :curve-type="curveType"
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

    <!-- Пороговые линии поверх графика -->
    <div class="pointer-events-none absolute inset-0">
      <div
        v-for="(t, i) in thresholdOverlay"
        :key="i"
        class="absolute flex items-center"
        :style="{
          top: `${t.top}px`,
          left: `${PAD.left}px`,
          right: `${PAD.right}px`,
        }"
      >
        <div
          class="h-px w-full border-t border-dashed"
          :style="{ borderColor: t.color, opacity: 0.7 }"
        />
        <span
          class="absolute right-0 -top-2 px-1 text-[10px] font-mono leading-none"
          :style="{ color: t.color }"
        >
          {{ t.label }}
        </span>
      </div>
    </div>
  </div>
</template>
