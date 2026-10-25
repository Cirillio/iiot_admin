<script lang="ts" setup>
import { plusIcon, saveIcon } from "~/core/icons-map";
import type { CreateDeviceDto, ModbusConnection } from "~/types/models";

const props = defineProps<{
  open: boolean;
  connections: ModbusConnection[];
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: CreateDeviceDto): void;
}>();

const form = reactive<{
  name: string;
  connectionId: number | undefined;
  slaveId: number;
  useGroupPolling: boolean;
  maxRegisterSpan: number;
  isActive: boolean;
}>({
  name: "",
  connectionId: undefined,
  slaveId: 1,
  useGroupPolling: true,
  maxRegisterSpan: 125,
  isActive: true,
});

const reset = () => {
  form.name = "";
  form.connectionId = undefined;
  form.slaveId = 1;
  form.useGroupPolling = true;
  form.maxRegisterSpan = 125;
  form.isActive = true;
};

watch(
  () => props.open,
  (v) => {
    if (!v) reset();
  },
);

const connectionOptions = computed(() =>
  props.connections.map((c) => ({
    label: `${c.ipAddress}:${c.port}${c.description ? ` — ${c.description}` : ""}`,
    value: c.id,
  })),
);

const errors = computed(() => {
  const errs: Record<string, string> = {};
  if (!form.name.trim()) {
    errs.name = "Device name is required";
  } else if (form.name.length > 100) {
    errs.name = "Device name cannot exceed 100 characters";
  }
  if (!form.connectionId || form.connectionId <= 0) {
    errs.connectionId = "Please select a connection";
  }
  if (!form.slaveId || form.slaveId < 1 || form.slaveId > 247) {
    errs.slaveId = "Slave ID must be between 1 and 247";
  }
  if (!form.maxRegisterSpan || form.maxRegisterSpan < 1 || form.maxRegisterSpan > 2000) {
    errs.maxRegisterSpan = "Span must be between 1 and 2000";
  }
  return errs;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

const handleSubmit = () => {
  if (!isValid.value) return;
  emits("submit", { ...form });
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
          <span class="font-semibold text-base">New device</span>
        </div>

        <USeparator />

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Name" :error="form.name ? errors.name : undefined" class="col-span-2">
            <UInput
              v-model="form.name"
              placeholder="ADAM-6017 Line A"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Connection" :error="errors.connectionId" class="col-span-2">
            <USelect
              v-model="form.connectionId"
              :items="connectionOptions"
              placeholder="Select a connection"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Slave ID" :error="errors.slaveId">
            <UInput v-model="form.slaveId" type="number" :min="1" :max="247" class="w-full" />
          </UFormField>

          <UFormField label="Max register span" :error="errors.maxRegisterSpan">
            <UInput v-model="form.maxRegisterSpan" type="number" :min="1" :max="2000" class="w-full" />
          </UFormField>

          <UFormField
            label="Group polling"
            class="col-span-2 flex items-center gap-3"
          >
            <USwitch v-model="form.useGroupPolling" />
            <span class="text-sm text-muted">{{
              form.useGroupPolling ? "Grouped reads" : "Per-register reads"
            }}</span>
          </UFormField>

          <UFormField label="Active" class="col-span-2 flex items-center gap-3">
            <USwitch v-model="form.isActive" />
            <span class="text-sm text-muted">{{
              form.isActive ? "Online" : "Offline"
            }}</span>
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
          <UButton
            label="Create"
            :leading-icon="saveIcon"
            :disabled="!isValid"
            @click="handleSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
