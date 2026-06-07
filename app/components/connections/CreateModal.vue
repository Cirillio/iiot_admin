<script lang="ts" setup>
import { plusIcon, saveIcon } from "~/core/icons-map";
import type { CreateConnectionDto } from "~/types/models";

const props = defineProps<{ open: boolean }>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: CreateConnectionDto): void;
}>();

const form = reactive({
  ipAddress: "",
  port: 502,
  description: "",
});

const reset = () => {
  form.ipAddress = "";
  form.port = 502;
  form.description = "";
};

watch(
  () => props.open,
  (v) => {
    if (!v) reset();
  },
);

const handleSubmit = () => {
  emits("submit", { ...form });
  emits("update:open", false);
};
</script>

<template>
  <UModal
    :open="props.open"
    :ui="{ content: 'max-w-md' }"
    @update:open="emits('update:open', $event)"
  >
    <template #content>
      <div class="flex flex-col gap-5 p-5">
        <div class="flex items-center gap-2">
          <UIcon :name="plusIcon" class="size-4 text-muted" />
          <span class="font-semibold text-base">New connection</span>
        </div>

        <USeparator />

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="IP Address" class="col-span-2">
            <UInput
              v-model="form.ipAddress"
              placeholder="192.168.1.100"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Port">
            <UInput v-model="form.port" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Description" class="col-span-2">
            <UInput
              v-model="form.description"
              placeholder="Line A gateway"
              class="w-full"
            />
          </UFormField>
        </div>

        <USeparator />

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="emits('update:open', false)"
          />
          <UButton label="Create" :leading-icon="saveIcon" @click="handleSubmit" />
        </div>
      </div>
    </template>
  </UModal>
</template>
