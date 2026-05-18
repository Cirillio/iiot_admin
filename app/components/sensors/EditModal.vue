<script lang="ts" setup>
import { saveIcon } from "~/core/icons-map";
import {
  type SensorSettings,
  type SensorDataType,
  type ModbusRegisterType,
  SENSOR_DATA_TYPE,
  MODBUS_REGISTER_TYPE,
} from "~/types/models";

const props = defineProps<{
  open: boolean;
  sensor: SensorSettings | null;
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: Partial<SensorSettings>): void;
}>();

const form = reactive<{
  name: string;
  slug: string;
  dataType: SensorDataType | undefined;
  unit: string;
  portNumber: number;
  registerAddress: number;
  registerType: ModbusRegisterType | undefined;
  registerCount: number;
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
  offsetVal: number;
  formula: string;
}>({
  name: "",
  slug: "",
  dataType: undefined,
  unit: "",
  portNumber: 0,
  registerAddress: 0,
  registerType: undefined,
  registerCount: 1,
  inputMin: 0,
  inputMax: 65535,
  outputMin: 0,
  outputMax: 100,
  offsetVal: 0,
  formula: "",
});

watch(
  () => props.sensor,
  (s) => {
    if (!s) return;
    form.name = s.name ?? "";
    form.slug = s.slug ?? "";
    form.dataType = s.dataType ?? undefined;
    form.unit = s.unit ?? "";
    form.portNumber = s.portNumber ?? 0;
    form.registerAddress = s.registerAddress ?? 0;
    form.registerType = s.registerType ?? "INPUT_REGISTER";
    form.registerCount = s.registerCount ?? 1;
    form.inputMin = s.inputMin ?? 0;
    form.inputMax = s.inputMax ?? 65535;
    form.outputMin = s.outputMin ?? 0;
    form.outputMax = s.outputMax ?? 100;
    form.offsetVal = s.offsetVal ?? 0;
    form.formula = s.formula ?? "";
  },
  { immediate: true },
);

const dataTypeOptions = Object.values(SENSOR_DATA_TYPE).map((v) => ({
  label: v,
  value: v,
}));

const registerTypeOptions = Object.values(MODBUS_REGISTER_TYPE).map((v) => ({
  label: v.replace(/_/g, ' '),
  value: v,
}));

const handleSubmit = () => {
  // TODO: подключить api.sensors.update(props.sensor?.sensorId, form)
  emits("submit", { ...form });
  emits("update:open", false);
};
</script>

<template>
  <UModal
    :open="props.open"
    :ui="{ content: 'max-w-lg' }"
    @update:open="emits('update:open', $event)"
  >
    <template #content>
      <div class="flex flex-col gap-5 p-5">
        <!-- Header -->
        <div class="flex flex-col gap-0.5">
          <span class="font-semibold text-base">Edit sensor</span>
          <span class="font-mono text-xs text-muted">ID: {{ sensor?.sensorId }}</span>
        </div>

        <USeparator />

        <!-- Form -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <UFormField label="Name" class="col-span-2">
            <UInput v-model="form.name" placeholder="Sensor name" class="w-full" />
          </UFormField>

          <UFormField label="Slug">
            <UInput v-model="form.slug" placeholder="sensor_slug" font-mono class="w-full" />
          </UFormField>

          <UFormField label="Type">
            <USelect v-model="form.dataType" :items="dataTypeOptions" class="w-full" />
          </UFormField>

          <UFormField label="Unit">
            <UInput v-model="form.unit" placeholder="Bar, °C, V…" class="w-full" />
          </UFormField>

          <UFormField label="Port №">
            <UInput v-model="form.portNumber" type="number" class="w-full" />
          </UFormField>

          <USeparator class="col-span-2" label="Modbus Settings" />

          <UFormField label="Register Addr">
            <UInput v-model="form.registerAddress" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Register Type">
            <USelect v-model="form.registerType" :items="registerTypeOptions" class="w-full" />
          </UFormField>

          <UFormField label="Register Count" class="col-span-2">
            <UInput v-model="form.registerCount" type="number" min="1" max="2" class="w-full" />
          </UFormField>

          <USeparator class="col-span-2" label="Scaling" />

          <UFormField label="Input Min">
            <UInput v-model="form.inputMin" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Input Max">
            <UInput v-model="form.inputMax" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Output Min">
            <UInput v-model="form.outputMin" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Output Max">
            <UInput v-model="form.outputMax" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Offset">
            <UInput v-model="form.offsetVal" type="number" class="w-full" />
          </UFormField>

          <UFormField label="Formula">
            <UInput v-model="form.formula" placeholder="slug_a * 2 + …" class="w-full" />
          </UFormField>
        </div>

        <USeparator />

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="emits('update:open', false)" />
          <UButton label="Save" :leading-icon="saveIcon" @click="handleSubmit" />
        </div>
      </div>
    </template>
  </UModal>
</template>
