<script setup lang="ts">
import { deviceIcon, sensorIcon } from "~/core/icons-map";
import type { DashboardDevice } from "~/types/models";

/**
 * @description
 * Карточка устройства на странице всех устройств - /devices
 */

interface Props {
  item: DashboardDevice;
}

defineProps<Props>();
</script>

<template>
  <NuxtLink
    :to="'/devices/' + item.id"
    class="rounded-md bg-muted/50 overflow-hidden relative hover:bg-muted/75 transition p-2 flex gap-4 flex-col"
  >
    <div
      class="absolute -top-4 right-2 bg-accented/50 aspect-square flex rounded-md p-1"
    >
      <UIcon
        :name="deviceIcon"
        class="size-9"
        :class="
          item.isActive ? 'text-emerald-300/75 animate-pulse' : 'text-muted'
        "
      />
    </div>
    <!-- header -->
    <div class="flex flex-col gap-1">
      <span class="text-muted text-base"
        >{{ item.ipAddress }}:{{ item.port }}</span
      >
      <span
        class="text-xl w-fit hover:text-amber-300/75 transition text-amber-300 font-semibold font-mono"
        >{{ item.name }}</span
      >
    </div>
    <!-- sensors -->
    <div class="flex flex-col gap-2">
      <UButton
        v-for="sensor in item.sensors?.slice(0, 3)"
        :key="sensor.sensorId + '_in_devicelistcard'"
        :leading-icon="sensorIcon"
        variant="subtle"
        color="neutral"
        size="lg"
        :to="'/sensors/' + sensor.sensorId"
        :ui="{
          leadingIcon: 'text-emerald-300/75',
        }"
      >
        <span class="flex justify-between items-center w-full">
          <span class="truncate">
            {{ sensor.name || "unnamed-sensor" }}
          </span>
          <span class="text-secondary/75 text-base">{{
            sensor.portNumber
          }}</span>
        </span>
      </UButton>
    </div>

    <div class="flex flex-col h-fit gap-2 mt-auto px-2">
      <span class="text-sm text-muted flex justify-between"
        >total-sensor: <span>{{ item.sensors?.length || 0 }}</span></span
      >
      <span class="text-sm text-muted flex justify-between"
        >device-id: <span>{{ item.id || "unknown" }}</span></span
      >
    </div>
  </NuxtLink>
</template>
