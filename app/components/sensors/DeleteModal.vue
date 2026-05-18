<script lang="ts" setup>
import { deleteIcon } from "~/core/icons-map";

const props = defineProps<{
  open: boolean;
  sensorName: string | null | undefined;
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <UModal :open="props.open" @update:open="emits('update:open', $event)">
    <template #content>
      <div class="flex flex-col gap-6 p-5">
        <div class="flex flex-col gap-1">
          <span class="font-semibold text-base">Delete sensor</span>
          <span class="text-sm text-muted">
            Are you sure you want to delete
            <span class="font-mono text-default">{{ sensorName ?? "this sensor" }}</span>?
            This action cannot be undone.
          </span>
        </div>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="emits('update:open', false)" />
          <UButton
            label="Delete"
            color="error"
            :leading-icon="deleteIcon"
            @click="emits('confirm')"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
