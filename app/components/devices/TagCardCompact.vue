<script setup lang="ts">
import { editIcon, paletteIcon, warningIcon } from "~/core/icons-map";
import type { TagSettings } from "~/types/models";
import { registerBadge } from "~/utils/tag";
import {
  digitalLabel,
  evaluateTagStatus,
  resolveTagColor,
  STATUS_COLOR,
} from "~/utils/tagStatus";

const props = defineProps<{ item: TagSettings }>();
const emit = defineEmits<{
  (e: "edit" | "appearance", tag: TagSettings): void;
}>();

const rt = useRealTimeStore();

const metric = computed(() =>
  props.item.tagId != null ? rt.getMetricByTagId(props.item.tagId) : undefined,
);

const rawValue = computed(() => metric.value?.value ?? null);
const isDigital = computed(() => props.item.dataType === "DIGITAL");
const ui = computed(() => props.item.uiConfigJson ?? null);

const status = computed(() =>
  evaluateTagStatus(rawValue.value, props.item.dataType, ui.value),
);

const displayValue = computed(() => {
  if (rawValue.value == null) return null;
  if (isDigital.value) return digitalLabel(rawValue.value, ui.value);
  return Number(rawValue.value).toFixed(2);
});

const accentColor = computed(() => {
  if (status.value === "critical") return STATUS_COLOR.critical;
  if (status.value === "warning") return STATUS_COLOR.warning;
  return resolveTagColor(ui.value, props.item.dataType);
});

const valueColor = computed(() =>
  displayValue.value == null ? undefined : accentColor.value,
);

const isAlarm = computed(
  () => status.value === "warning" || status.value === "critical",
);

const regBadge = computed(() => registerBadge(props.item.registerType));
</script>

<template>
  <div
    class="group relative flex items-center gap-3 rounded-md border bg-elevated/20 overflow-hidden pl-0 pr-3 py-2.5 transition-colors hover:bg-elevated/40"
    :class="isAlarm ? '' : 'border-default hover:border-tertiary/30'"
    :style="isAlarm ? { borderColor: accentColor } : undefined"
  >
    <!-- Type / status accent bar -->
    <div class="w-0.5 self-stretch shrink-0" :style="{ backgroundColor: accentColor }" />

    <!-- Port -->
    <UBadge
      variant="outline"
      color="neutral"
      size="xs"
      class="font-mono tabular-nums shrink-0"
    >
      P{{ item.portNumber }}
    </UBadge>

    <UBadge
      v-if="regBadge"
      :color="regBadge.color"
      variant="soft"
      size="xs"
      class="font-mono shrink-0"
      :title="regBadge.full"
    >
      {{ regBadge.label }}
    </UBadge>

    <UIcon
      v-if="isAlarm"
      :name="warningIcon"
      class="size-4 shrink-0"
      :style="{ color: accentColor }"
    />

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
        :class="displayValue == null ? 'text-muted/30' : ''"
        :style="valueColor ? { color: valueColor } : undefined"
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

    <!-- Actions -->
    <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <UButton
        :icon="paletteIcon"
        size="xs"
        variant="ghost"
        color="neutral"
        @click="emit('appearance', item)"
      />
      <UButton
        :icon="editIcon"
        size="xs"
        variant="ghost"
        color="neutral"
        @click="emit('edit', item)"
      />
    </div>
  </div>
</template>
