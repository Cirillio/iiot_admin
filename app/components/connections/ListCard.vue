<script setup lang="ts">
import {
  connectionIcon,
  deleteIcon,
  editIcon,
  gatewayIcon,
} from "~/core/icons-map";
import type { ModbusConnection } from "~/types/models";

const props = defineProps<{ item: ModbusConnection }>();

const emit = defineEmits<{
  (e: "edit", item: ModbusConnection): void;
  (e: "delete", item: ModbusConnection): void;
}>();
</script>

<template>
  <div
    class="group relative rounded-lg border border-default bg-elevated/20 hover:border-tertiary/50 hover:bg-elevated/50 transition-colors duration-100 ease-out overflow-hidden"
  >
    <!-- Action buttons -->
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

    <div class="flex flex-col gap-4 p-5">
      <!-- Background watermark -->
      <UIcon
        :name="connectionIcon"
        class="absolute -bottom-3 -right-3 size-24 pointer-events-none opacity-5"
      />

      <!-- ID -->
      <div class="flex items-center gap-2">
        <UIcon :name="connectionIcon" class="size-4 text-muted shrink-0" />
        <span class="text-xs font-semibold uppercase tracking-widest text-muted">
          Connection
        </span>
        <span class="ml-auto text-xs font-mono text-muted/50 pr-14"
          >#{{ item.id }}</span
        >
      </div>

      <!-- Endpoint -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1.5 text-2xl font-bold font-mono">
          <UIcon :name="gatewayIcon" class="size-5 shrink-0 text-muted" />
          <span class="break-all"
            >{{ item.ipAddress }}<span class="text-muted">:{{ item.port }}</span></span
          >
        </div>
      </div>

      <!-- Description -->
      <div
        class="flex items-center gap-1.5 mt-auto pt-3 border-t border-default/60 text-sm text-muted"
      >
        <span class="truncate">{{ item.description || "No description" }}</span>
      </div>
    </div>
  </div>
</template>
