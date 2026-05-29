<script setup lang="ts">
import { editIcon } from "~/core/icons-map";
import type { TagDataType, TagSettings } from "~/types/models";

const props = defineProps<{ item: TagSettings }>();
const emit = defineEmits<{ (e: "edit", tag: TagSettings): void }>();

const rt = useRealTimeStore();

const metric = computed(() =>
  props.item.tagId != null
    ? rt.getMetricByTagId(props.item.tagId)
    : undefined,
);

const isDigital = computed(() => props.item.dataType === "DIGITAL");

const displayValue = computed(() => {
  const v = metric.value?.value;
  if (v == null) return null;
  if (isDigital.value) return v >= 0.5 ? "ON" : "OFF";
  return Number(v).toFixed(2);
});

const TYPE_BAR: Record<TagDataType, string> = {
  ANALOG_RAW: "bg-info-500",
  ANALOG_PHYSICAL: "bg-info-500",
  DIGITAL: "bg-success-500",
  VIRTUAL: "bg-warning-500",
};

const TYPE_VALUE: Record<TagDataType, string> = {
  ANALOG_RAW: "text-info-300",
  ANALOG_PHYSICAL: "text-info-300",
  DIGITAL: "text-success-300",
  VIRTUAL: "text-warning-300",
};

const barClass = computed(() =>
  props.item.dataType ? TYPE_BAR[props.item.dataType] : "bg-neutral-600",
);

const valueClass = computed(() => {
  if (displayValue.value == null) return "text-muted/30";
  if (isDigital.value && displayValue.value === "OFF") return "text-muted/50";
  return props.item.dataType ? TYPE_VALUE[props.item.dataType] : "text-default";
});
</script>

<template>
  <div
    class="group relative flex items-center gap-3 rounded-md border border-default bg-elevated/20 overflow-hidden pl-0 pr-3 py-2.5 transition-colors hover:border-tertiary/30 hover:bg-elevated/40"
  >
    <!-- Type accent bar -->
    <div class="w-0.5 self-stretch shrink-0" :class="barClass" />

    <!-- Port -->
    <UBadge
      variant="outline"
      color="neutral"
      size="xs"
      class="font-mono tabular-nums shrink-0"
    >
      P{{ item.portNumber }}
    </UBadge>

    <!-- Name + slug -->
    <div class="flex flex-col min-w-0 flex-1">
      <span class="text-sm font-semibold leading-tight truncate">
        {{ item.name || "Unnamed" }}
      </span>
      <span v-if="item.slug" class="text-xs font-mono text-muted/60 truncate">
        {{ item.slug }}
      </span>
    </div>

    <!-- Value -->
    <div class="flex items-baseline gap-1 shrink-0">
      <span
        class="text-lg font-mono font-bold tabular-nums leading-none transition-colors"
        :class="valueClass"
      >
        {{ displayValue ?? "—" }}
      </span>
      <span
        v-if="item.unit && !isDigital"
        class="text-xs text-muted uppercase tracking-wider font-mono"
      >
        {{ item.unit }}
      </span>
    </div>

    <!-- Edit -->
    <UButton
      :icon="editIcon"
      size="xs"
      variant="ghost"
      color="neutral"
      class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      @click="emit('edit', item)"
    />
  </div>
</template>
