<script lang="ts" setup>
import { editIcon } from "~/core/icons-map";
import { SENSOR_TYPE_COLOR, type SensorDataType, type SensorSettings } from "~/types/models";

const props = defineProps<{
  item: SensorSettings;
}>();

const emit = defineEmits<{
  (e: "edit", sensor: SensorSettings): void;
}>();

const rt = useRealTimeStore();

const metric = computed(() =>
  props.item.sensorId != null ? rt.getValueBySensorId(props.item.sensorId) : undefined,
);

const displayValue = computed(() => {
  if (metric.value == null) return null;
  const v = metric.value.value;
  return v != null ? Number(v).toFixed(2) : null;
});

// Static map — full class strings required for Tailwind v4 scanning
const ACCENT_CLASS: Record<SensorDataType, string> = {
  ANALOG: "bg-info-500",
  DIGITAL: "bg-success-500",
  VIRTUAL: "bg-warning-500",
};

const accentClass = computed(() =>
  props.item.dataType ? ACCENT_CLASS[props.item.dataType] : "bg-neutral-500",
);
</script>

<template>
  <div
    class="group relative flex flex-col gap-2.5 rounded-lg border border-default bg-elevated/30 p-3 pl-3.5 overflow-hidden transition-colors hover:border-tertiary/40 hover:bg-elevated/60"
  >
    <!-- type accent bar -->
    <div class="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" :class="accentClass" />

    <!-- top: name + port -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-col gap-0.5 min-w-0">
        <span class="font-mono font-bold text-sm leading-tight truncate">
          {{ item.name || "Unnamed" }}
        </span>
        <span v-if="item.slug" class="text-[10px] text-muted font-mono truncate leading-none">
          {{ item.slug }}
        </span>
      </div>
      <UBadge variant="outline" color="neutral" size="xs" class="shrink-0 font-mono tabular-nums">
        P{{ item.portNumber }}
      </UBadge>
    </div>

    <!-- value -->
    <div class="flex items-baseline gap-1.5">
      <span
        class="text-2xl font-mono font-bold tabular-nums leading-none"
        :class="displayValue != null ? 'text-default' : 'text-muted/40'"
      >
        {{ displayValue ?? "—" }}
      </span>
      <span v-if="item.unit" class="text-xs text-muted uppercase tracking-wider">
        {{ item.unit }}
      </span>
    </div>

    <!-- footer: id + edit -->
    <div class="flex items-center justify-between pt-1.5 border-t border-default/40">
      <NuxtLink
        :to="`/sensors/${item.sensorId}`"
        class="text-[10px] text-muted/60 font-mono hover:text-muted transition-colors"
        @click.stop
      >
        #{{ item.sensorId }}
      </NuxtLink>
      <UButton
        :leading-icon="editIcon"
        size="xs"
        variant="ghost"
        color="neutral"
        class="opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="emit('edit', item)"
      />
    </div>
  </div>
</template>
