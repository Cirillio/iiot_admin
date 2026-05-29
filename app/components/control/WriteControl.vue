<script setup lang="ts">
import { MODBUS_REGISTER_TYPE } from "~/types/models";
import { COMMAND_STATUS, type CommandStatus } from "~/types/api";
import type { WritableTag } from "~/utils/tag";

const props = defineProps<{ tag: WritableTag }>();

const commands = useCommandsStore();

const isCoil = computed(() => props.tag.registerType === MODBUS_REGISTER_TYPE.COIL);

// Последняя команда по тегу — для индикации жизненного цикла на карточке.
const lastCommand = computed(() => commands.getByTagId(props.tag.tagId));

const STATUS_META: Record<
  CommandStatus,
  { label: string; color: "neutral" | "info" | "success" | "error" }
> = {
  PENDING: { label: "В очереди", color: "neutral" },
  PROCESSING: { label: "Выполняется", color: "info" },
  SUCCESS: { label: "Успешно", color: "success" },
  FAILED: { label: "Ошибка", color: "error" },
};

const accentClass = computed(() =>
  isCoil.value ? "bg-warning-500" : "bg-primary-500",
);
</script>

<template>
  <div
    class="group relative flex flex-col rounded-lg border border-default bg-elevated/20 overflow-hidden transition-colors hover:border-tertiary/30"
  >
    <div class="h-1 w-full shrink-0" :class="accentClass" />

    <div class="flex flex-col gap-3 p-4">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="text-sm font-semibold leading-tight truncate">
            {{ tag.name || "Unnamed tag" }}
          </span>
          <span v-if="tag.slug" class="text-xs font-mono text-muted/60 truncate">
            {{ tag.slug }}
          </span>
        </div>
        <UBadge variant="outline" color="neutral" size="xs" class="font-mono shrink-0">
          {{ isCoil ? "COIL" : "HOLDING" }}
        </UBadge>
      </div>

      <!-- Control widget -->
      <div class="border-t border-default/50 pt-3">
        <ControlCoilToggle v-if="isCoil" :tag="tag" />
        <ControlHoldingSetpoint v-else :tag="tag" />
      </div>

      <!-- Last command status -->
      <div v-if="lastCommand" class="flex items-center gap-2">
        <UBadge
          :color="STATUS_META[lastCommand.status].color"
          variant="soft"
          size="xs"
        >
          {{ STATUS_META[lastCommand.status].label }}
        </UBadge>
        <span
          v-if="lastCommand.status === COMMAND_STATUS.FAILED && lastCommand.errorMessage"
          class="text-xs text-error-400 truncate"
          :title="lastCommand.errorMessage"
        >
          {{ lastCommand.errorMessage }}
        </span>
      </div>
    </div>
  </div>
</template>
