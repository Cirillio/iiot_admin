<script lang="ts" setup>
import { saveIcon } from "~/core/icons-map";
import type { Device, UpdateDeviceDto } from "~/types/models";

const props = defineProps<{
  open: boolean;
  device: Device | null;
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: UpdateDeviceDto): void;
}>();

const form = reactive<UpdateDeviceDto>({
  name: "",
  ipAddress: "",
  port: 502,
  slaveId: 1,
  isActive: true,
});

watch(
  () => props.device,
  (d) => {
    if (!d) return;
    form.name = d.name ?? "";
    form.ipAddress = d.ipAddress ?? "";
    form.port = d.port ?? 502;
    form.slaveId = d.slaveId ?? 1;
    form.isActive = d.isActive ?? true;
  },
  { immediate: true },
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
        <div class="flex flex-col gap-0.5">
          <span class="font-semibold text-base">Edit device</span>
          <span class="font-mono text-xs text-muted">ID: {{ device?.id }}</span>
        </div>

        <USeparator />

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Name" class="col-span-2">
            <UInput v-model="form.name" placeholder="Device name" class="w-full" />
          </UFormField>

          <UFormField label="IP Address" class="col-span-2">
            <UInput v-model="form.ipAddress" placeholder="192.168.1.100" class="w-full" />
          </UFormField>

          <UFormField label="Port">
            <UInput v-model="form.port" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Slave ID">
            <UInput v-model="form.slaveId" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Active" class="col-span-2 flex items-center gap-3">
            <UToggle v-model="form.isActive" />
            <span class="text-sm text-muted">{{ form.isActive ? "Online" : "Offline" }}</span>
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
          <UButton label="Save" :leading-icon="saveIcon" @click="handleSubmit" />
        </div>
      </div>
    </template>
  </UModal>
</template>
