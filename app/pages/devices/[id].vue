<script lang="ts" setup>
import {
  arrowLeftIcon,
  binaryIcon,
  deviceIcon,
  gatewayIcon,
  hashIcon,
  reloadIcon,
  sensorIcon,
} from "~/core/icons-map";

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

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

definePageMeta({
  title: "Device Page",
  description: "Management and monitoring of device connected to IIoT",
});
</script>

<template>
  <div class="overflow-hidden w-full h-full flex flex-col">
    <!-- header -->
    <div class="flex p-4 border-b border-default relative items-center gap-4">
      <div class="flex items-center gap-1">
        <UButton
          size="lg"
          title="back to devices"
          :icon="arrowLeftIcon"
          variant="ghost"
          color="neutral"
          to="/devices"
        />
        <UButton
          size="lg"
          title="refresh data"
          :icon="reloadIcon"
          variant="outline"
          color="neutral"
          :disabled="pending"
          @click="() => refresh()"
        />
      </div>

      <div class="flex text-muted flex-col gap-2">
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-muted text-xs flex items-center gap-1">
            <UIcon :name="hashIcon" class="size-3" />
            ID:
            <div class="text-tertiary">
              {{ device?.id }}
            </div>
          </span>
          <span
            v-if="device?.ipAddress"
            class="text-muted text-xs flex items-center gap-1"
          >
            <UIcon :name="gatewayIcon" class="size-3" />
            <div class="text-tertiary">
              {{ device?.ipAddress }}:{{ device?.port }}
            </div>
          </span>
          <span
            v-if="device?.slaveId !== undefined"
            class="text-muted text-xs flex items-center gap-1"
          >
            <UIcon :name="binaryIcon" class="size-3" />
            Slave ID:
            <div class="text-tertiary">{{ device?.slaveId }}</div>
          </span>
        </div>

        <h1 class="text-3xl font-bold bg-amber-200 w-fit text-black px-1">
          {{ device?.name }}
        </h1>

        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1">
            <UIcon :name="sensorIcon" class="size-3" />
            sensors:
            <span class="text-tertiary">
              {{ device?.totalSensors || sensors.length }}</span
            >
          </span>
          <span
            >added:
            <span class="text-tertiary">
              {{ formatDate(device?.createdAt) }}
            </span>
          </span>
        </div>
      </div>

      <div
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-accented/50 aspect-square size-fit flex rounded-md p-1"
      >
        <UIcon
          :name="deviceIcon"
          class="size-12"
          :class="
            device?.isActive
              ? 'text-tertiary/75 animate-pulse'
              : 'text-muted'
          "
        />
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
