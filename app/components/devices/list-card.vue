<script setup lang="ts">
import {
  binaryIcon,
  deleteIcon,
  deviceIcon,
  editIcon,
  gatewayIcon,
  sensorIcon,
} from "~/core/icons-map";
import type { DashboardDevice } from "~/types/models";

const props = defineProps<{ item: DashboardDevice }>();

const emit = defineEmits<{
  (e: "edit", item: DashboardDevice): void;
  (e: "delete", item: DashboardDevice): void;
}>();
</script>

<template>
  <div
    class="group relative rounded-lg border border-default bg-elevated/20 hover:border-tertiary/50 hover:bg-elevated/50 transition-colors duration-100 ease-out overflow-hidden"
  >
    <!-- Action buttons — appear on hover, stop navigation -->
    <div
      class="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
    >
      <UButton
        :icon="editIcon"
        size="xs"
        variant="solid"
        color="neutral"
        @click.prevent="emit('edit', item)"
      />
      <UButton
        :icon="deleteIcon"
        size="xs"
        variant="solid"
        color="error"
        @click.prevent="emit('delete', item)"
      />
    </div>

    <NuxtLink :to="`/devices/${item.id}`" class="flex flex-col gap-4 p-5">
      <!-- Background watermark -->
      <UIcon
        :name="deviceIcon"
        class="absolute -bottom-3 -right-3 size-24 pointer-events-none opacity-5 transition-opacity duration-100"
      />

      <!-- Status + ID -->
      <div class="flex items-center gap-2">
        <span
          class="size-2.5 rounded-full shrink-0"
          :class="
            item.isActive
              ? 'bg-success-500 shadow-[0_0_6px_var(--color-success-500)]'
              : 'bg-neutral-600'
          "
        />
        <span
          class="text-xs font-semibold uppercase tracking-widest"
          :class="item.isActive ? 'text-success-400' : 'text-muted'"
        >
          {{ item.isActive ? "Active" : "Inactive" }}
        </span>
        <span class="ml-auto text-xs font-mono text-muted/50 pr-14"
          >#{{ item.id }}</span
        >
      </div>

      <!-- Name + Address -->
      <div class="flex flex-col gap-1">
        <h2
          class="text-2xl font-bold font-mono leading-tight break-all line-clamp-2 group-hover:text-tertiary transition-colors"
        >
          {{ item.name }}
        </h2>
        <div
          v-if="item.ipAddress"
          class="flex items-center gap-1.5 text-sm text-muted"
        >
          <UIcon :name="gatewayIcon" class="size-4 shrink-0" />
          <span class="font-mono">{{ item.ipAddress }}:{{ item.port }}</span>
        </div>
      </div>

      <!-- Stats footer -->
      <div
        class="flex items-center gap-5 mt-auto pt-3 border-t border-default/60 text-sm"
      >
        <div class="flex items-center gap-1.5 text-muted">
          <UIcon :name="binaryIcon" class="size-4 shrink-0" />
          <span>Slave</span>
          <span class="font-mono font-semibold text-default">{{
            item.slaveId ?? "—"
          }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-muted">
          <UIcon :name="sensorIcon" class="size-4 shrink-0" />
          <span class="font-mono font-semibold text-default">{{
            item.totalSensors ?? 0
          }}</span>
          <span>sensors</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
