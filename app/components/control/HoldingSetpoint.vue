<script setup lang="ts">
import { saveIcon } from "~/core/icons-map";
import type { WritableTag } from "~/utils/tag";

const props = defineProps<{ tag: WritableTag }>();

const rt = useRealTimeStore();
const { send, isInFlight } = useWriteCommand(props.tag.tagId);

const metric = computed(() => rt.getMetricByTagId(props.tag.tagId));
const currentValue = computed(() =>
  metric.value?.value != null ? Number(metric.value.value).toFixed(2) : "—",
);

const input = ref<number | null>(null);
const canSend = computed(() => input.value != null && !isInFlight.value);

function submit() {
  if (input.value == null) return;
  send(input.value);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex flex-col">
      <span class="text-xs text-muted uppercase tracking-wider">Текущее</span>
      <span class="text-sm font-mono tabular-nums">
        {{ currentValue }}<span v-if="tag.unit" class="text-muted/60 ml-1">{{ tag.unit }}</span>
      </span>
    </div>

    <UInput
      v-model.number="input"
      type="number"
      placeholder="Уставка"
      size="sm"
      class="w-28 ml-auto"
      :disabled="isInFlight"
      @keydown.enter="submit"
    />
    <UButton
      :icon="saveIcon"
      :loading="isInFlight"
      :disabled="!canSend"
      color="primary"
      variant="subtle"
      size="sm"
      @click="submit"
    >
      Записать
    </UButton>
  </div>
</template>
