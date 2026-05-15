<script setup lang="ts">
import { binaryIcon, deviceIcon, gatewayIcon, hashIcon, sensorIcon } from "~/core/icons-map";
import type { DashboardDevice } from "~/types/models";

defineProps<{ item: DashboardDevice }>();
</script>

<template>
  <NuxtLink
    :to="`/devices/${item.id}`"
    class="group relative rounded-lg border border-default bg-elevated/20 hover:border-tertiary/50 hover:bg-elevated/50 transition-colors duration-100 ease-out p-5 flex flex-col gap-4 overflow-hidden"
  >
    <!-- Background icon -->
    <UIcon
      :name="deviceIcon"
      class="absolute -bottom-3 -right-3 size-24 transition-opacity duration-100"
      :class="item.isActive ? 'text-tertiary/8 group-hover:text-tertiary/12' : 'text-muted/5'"
    />

    <!-- Top row: status + ID -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span
          class="size-2.5 rounded-full shrink-0"
          :class="item.isActive
            ? 'bg-success-500 shadow-[0_0_6px_var(--color-success-500)]'
            : 'bg-neutral-600'"
        />
        <span
          class="text-xs font-semibold uppercase tracking-widest"
          :class="item.isActive ? 'text-success-400' : 'text-muted'"
        >
          {{ item.isActive ? "Active" : "Inactive" }}
        </span>
      </div>
      <span class="text-xs font-mono text-muted/60">#{{ item.id }}</span>
    </div>

    <!-- Device name -->
    <div class="flex flex-col gap-1">
      <h2 class="text-2xl font-bold font-mono leading-tight break-all line-clamp-2 group-hover:text-tertiary transition-colors">
        {{ item.name }}
      </h2>
      <div v-if="item.ipAddress" class="flex items-center gap-1.5 text-sm text-muted">
        <UIcon :name="gatewayIcon" class="size-4 shrink-0" />
        <span class="font-mono">{{ item.ipAddress }}:{{ item.port }}</span>
      </div>
    </div>

    <!-- Bottom stats -->
    <div class="flex items-center gap-4 mt-auto pt-3 border-t border-default/60 text-sm">
      <div class="flex items-center gap-1.5 text-muted">
        <UIcon :name="binaryIcon" class="size-4 shrink-0" />
        <span>Slave</span>
        <span class="font-mono font-semibold text-default">{{ item.slaveId ?? "—" }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-muted">
        <UIcon :name="sensorIcon" class="size-4 shrink-0" />
        <span class="font-mono font-semibold text-default">{{ item.totalSensors ?? 0 }}</span>
        <span>sensors</span>
      </div>
    </div>
  </NuxtLink>
</template>
