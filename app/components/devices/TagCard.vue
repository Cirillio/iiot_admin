<script setup lang="ts">
import { editIcon } from "~/core/icons-map";
import type { TagDataType, TagSettings } from "~/types/models";

const props = defineProps<{ item: TagSettings }>();

const emit = defineEmits<{
  (e: "edit", tag: TagSettings): void;
}>();

const rt = useRealTimeStore();

const metric = computed(() =>
  props.item.tagId != null
    ? rt.getMetricByTagId(props.item.tagId)
    : undefined,
);

const isDigital = computed(() => props.item.dataType === "DIGITAL");

const displayValue = computed(() => {
  if (metric.value == null) return null;
  const v = metric.value.value;
  if (v == null) return null;
  if (isDigital.value) return v >= 0.5 ? "ON" : "OFF";
  return Number(v).toFixed(2);
});

const hasValue = computed(() => displayValue.value != null);

// Full static class strings — required for Tailwind v4 scanning
const TYPE_TOP_BAR: Record<TagDataType, string> = {
  ANALOG_RAW: "bg-info-500",
  ANALOG_PHYSICAL: "bg-info-500",
  DIGITAL: "bg-success-500",
  VIRTUAL: "bg-warning-500",
};

const TYPE_VALUE_COLOR: Record<TagDataType, string> = {
  ANALOG_RAW: "text-info-300",
  ANALOG_PHYSICAL: "text-info-300",
  DIGITAL: "text-success-300",
  VIRTUAL: "text-warning-300",
};

const topBarClass = computed(() =>
  props.item.dataType ? TYPE_TOP_BAR[props.item.dataType] : "bg-neutral-600",
);

const valueColorClass = computed(() => {
  if (!hasValue.value) return "text-muted/30";
  if (isDigital.value && displayValue.value === "OFF") return "text-muted/50";
  return props.item.dataType
    ? TYPE_VALUE_COLOR[props.item.dataType]
    : "text-default";
});
</script>

<template>
  <div
    class="group relative flex flex-col rounded-lg border border-default bg-elevated/20 overflow-hidden transition-colors hover:border-tertiary/30 hover:bg-elevated/40"
  >
    <!-- Type accent bar -->
    <div class="h-1 w-full shrink-0" :class="topBarClass" />

    <div class="flex flex-col gap-3 p-4">
      <!-- Port + Edit -->
      <div class="flex items-center justify-between">
        <UBadge
          variant="outline"
          color="neutral"
          size="xs"
          class="font-mono tabular-nums"
        >
          P{{ item.portNumber }}
        </UBadge>
        <UButton
          :icon="editIcon"
          size="xs"
          variant="ghost"
          color="neutral"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
          @click="emit('edit', item)"
        />
      </div>

      <!-- Value block -->
      <div class="flex flex-col gap-0.5">
        <span
          class="text-4xl font-mono font-bold tabular-nums leading-none tracking-tight transition-colors"
          :class="valueColorClass"
        >
          {{ displayValue ?? "—" }}
        </span>
        <span
          v-if="item.unit && !isDigital"
          class="text-sm text-muted uppercase tracking-wider font-mono"
        >
          {{ item.unit }}
        </span>
      </div>

      <!-- Tag name + slug -->
      <div class="flex flex-col gap-0.5 border-t border-default/50 pt-3">
        <span class="text-sm font-semibold leading-tight">
          {{ item.name || "Unnamed tag" }}
        </span>
        <span v-if="item.slug" class="text-xs font-mono text-muted/60 truncate">
          {{ item.slug }}
        </span>
      </div>
    </div>
  </div>
</template>
