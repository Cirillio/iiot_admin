<script setup lang="ts">
import type { WritableTag } from "~/utils/tag";

const props = defineProps<{ tag: WritableTag }>();

const rt = useRealTimeStore();
const { send, isInFlight } = useWriteCommand(props.tag.tagId);

const metric = computed(() => rt.getMetricByTagId(props.tag.tagId));
const hasState = computed(() => metric.value?.value != null);
const isOn = computed(() => (metric.value?.value ?? 0) >= 0.5);

function toggle() {
  send(isOn.value ? 0 : 1);
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span
        class="size-2.5 rounded-full shrink-0"
        :class="
          !hasState
            ? 'bg-neutral-600'
            : isOn
              ? 'bg-success-500 shadow-[0_0_8px] shadow-success-500/60'
              : 'bg-neutral-600'
        "
      />
      <span class="text-sm font-mono uppercase tracking-wider text-muted">
        {{ !hasState ? "—" : isOn ? "ON" : "OFF" }}
      </span>
    </div>

    <UButton
      :label="isOn ? 'Выключить' : 'Включить'"
      :color="isOn ? 'error' : 'success'"
      :loading="isInFlight"
      :disabled="isInFlight"
      variant="subtle"
      size="sm"
      @click="toggle"
    />
  </div>
</template>
