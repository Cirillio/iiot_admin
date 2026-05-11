<script lang="ts" setup>
import { deviceIcon } from "~/core/icons-map";

const { isFluid } = useLayout();

const api = useApi();

const route = useRoute();

const deviceId = route.params.id;

const { data, error, pending, refresh } = useAsyncData(
  `device-${deviceId}`,
  () => api.devices.getById(Number(deviceId)),
  {
    immediate: true,
  },
);

const device = computed(() => {
  const { sensors, ...rest } = data.value || {};
  return rest;
});

const sensors = computed(() => {
  return data.value?.sensors || [];
});

definePageMeta({
  title: "Device Page",
  description: "Management and monitoring of device connected to IIoT",
});
</script>

<template>
  <div class="overflow-hidden w-full h-full flex flex-col">
    <!-- header -->
    <div class="flex p-4 border-b border-default relative">
      <div
        class="absolute -right-2 top-1/2 -translate-y-1/2 bg-accented/50 aspect-square size-fit flex rounded-md p-1"
      >
        <UIcon
          :name="deviceIcon"
          class="size-12"
          :class="
            device?.isActive
              ? 'text-emerald-300/75 animate-pulse'
              : 'text-muted'
          "
        />
      </div>
      <div class="grid gap-2">
        <span class="text-muted text-sm">device: {{ device?.id }}</span>
        <h1 class="text-3xl font-bold bg-amber-200 w-fit text-black px-1">
          {{ device?.name }}
        </h1>
        <span class="text-sm text-emerald-300/75"
          >added: {{ device?.createdAt }}</span
        >
      </div>
    </div>
    <!-- sensors -->
    <div class="flex flex-col p-4 flex-1 min-h-0 overflow-hidden gap-4">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        Connected Sensors ({{ sensors.length }})
      </h2>

      <ScrollableWrapper>
        <div class="grid gap-4" :class="[isFluid || 'grid-cols-2']">
          <DevicesSensorCard
            v-for="sensor in sensors"
            :key="sensor.sensorId"
            :item="sensor"
            :optimize="!isFluid"
          />
        </div>
      </ScrollableWrapper>
    </div>
  </div>
</template>
