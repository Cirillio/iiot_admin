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
    class="group relative flex flex-col rounded-lg border bg-elevated/20 overflow-hidden transition-colors hover:bg-elevated/40"
    :class="isAlarm ? '' : 'border-default hover:border-tertiary/30'"
    :style="isAlarm ? { borderColor: accentColor } : undefined"
  >
    <!-- Type / status accent bar -->
    <div class="h-1 w-full shrink-0" :style="{ backgroundColor: accentColor }" />

    <div class="flex flex-col gap-3 p-4">
      <!-- Port + actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <UBadge
            variant="outline"
            color="neutral"
            size="xs"
            class="font-mono tabular-nums"
          >
            P{{ item.portNumber }}
          </UBadge>
          <UBadge
            v-if="regBadge"
            :color="regBadge.color"
            variant="soft"
            size="xs"
            class="font-mono"
            :title="regBadge.full"
          >
            {{ regBadge.label }}<span class="opacity-60 ml-1">{{ regBadge.rw ? "RW" : "RO" }}</span>
          </UBadge>
          <UIcon
            v-if="isAlarm"
            :name="warningIcon"
            class="size-4"
            :style="{ color: accentColor }"
          />
        </div>
        <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
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

      <!-- Value block -->
      <div class="flex flex-col gap-0.5">
        <span
          class="text-4xl font-mono font-bold tabular-nums leading-none tracking-tight transition-colors"
          :class="displayValue == null ? 'text-muted/30' : ''"
          :style="valueColor ? { color: valueColor } : undefined"
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
        <span class="text-sm font-semibold leading-tight truncate">
          {{ item.name || "Unnamed tag" }}
        </span>
        <span v-if="item.slug" class="text-xs font-mono text-muted/60 truncate">
          {{ item.slug }}
        </span>
      </div>
    </div>
  </div>
</template>
