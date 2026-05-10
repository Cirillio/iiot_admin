<script lang="ts" setup>
import { chartIcon, sensorIcon } from "~/core/icons-map";
import type { SensorSettings } from "~/types/models";

defineProps<{
  item: SensorSettings;
  optimize?: boolean;
}>();

const showValues = ref<boolean>(false);

const toggleShowValues = () => {
  showValues.value = !showValues.value;
};
</script>

<template>
  <NuxtLink
    :to="'/sensors/' + item.sensorId"
    class="group bg-muted/50 h-fit relative overflow-hidden rounded-lg p-4 hover:bg-muted transition-colors flex items-center gap-4"
    :class="[!optimize ? 'items-center' : 'items-start flex-col']"
  >
    <UIcon
      v-if="optimize"
      :name="sensorIcon"
      class="text-emerald-300/75 size-16 absolute -top-4 -right-2 animate-pulse"
    />
    <UBadge
      variant="outline"
      color="neutral"
      class="flex-col aspect-square! w-fit min-w-0 min-h-0 gap-0"
    >
      <span class="text-base font-bold font-mono text-emerald-300">{{
        item.portNumber
      }}</span>
      <span class="text-xs uppercase text-muted leading-none">Port</span>
    </UBadge>

    <div class="flex flex-col items-start gap-1 min-w-0 flex-1">
      <div
        class="flex items-center gap-2"
        :class="[!optimize || 'flex-col items-start']"
      >
        <span
          class="text-xl font-mono font-bold truncate group-hover:text-amber-300 transition-colors"
        >
          {{ item.name || "Unnamed Sensor" }}
        </span>
        <div class="flex gap-2">
          <UBadge
            variant="subtle"
            color="neutral"
            size="sm"
            class="text-[10px] px-1.5 py-0"
          >
            {{ item.dataType }}
          </UBadge>
          <UBadge
            v-if="item.slug"
            :label="item.slug"
            size="lg"
            color="neutral"
            class="text-[10px] px-1.5 py-0"
            variant="subtle"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 mt-1">
        <div class="flex items-center gap-1">
          <span class="text-base text-muted uppercase">Unit:</span>
          <span class="text-sm font-mono text-emerald-400/80">{{
            item.unit || "—"
          }}</span>
        </div>
        <div class="flex items-center gap-1 min-w-0">
          <span class="text-sm text-muted uppercase">ID:</span>
          <span class="text-sm font-mono truncate text-muted/70">{{
            item.sensorId
          }}</span>
        </div>
      </div>
    </div>

    <div v-if="showValues" class="mx-auto max-w-3xl space-y-6 rounded-lg">
      <!-- TODO: line charts  -->
    </div>

    <UButton
      :leading-icon="chartIcon"
      label="show values"
      variant="soft"
      size="lg"
      color="info"
      :block="optimize"
      @click.prevent.stop="toggleShowValues"
    />
  </NuxtLink>
</template>
