<script lang="ts" setup>
import { plusIcon, saveIcon } from "~/core/icons-map";
import {
  MODBUS_ENDIANNESS,
  MODBUS_REGISTER_TYPE,
  type CreateTagDto,
  type DashboardDevice,
  type Device,
  type ModbusEndianness,
  type ModbusRegisterType,
  TAG_DATA_TYPE,
  type TagDataType,
} from "~/types/models";

const props = defineProps<{
  open: boolean;
  devices: (Device | DashboardDevice)[];
  /** Если задан — селектор девайса заблокирован (создание со страницы девайса) */
  fixedDeviceId?: number;
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: CreateTagDto): void;
}>();

const makeDefaults = () => ({
  deviceId: props.fixedDeviceId ?? undefined,
  portNumber: 0,
  name: "",
  slug: "",
  dataType: TAG_DATA_TYPE.ANALOG_PHYSICAL as TagDataType,
  registerAddress: 0,
  registerType: MODBUS_REGISTER_TYPE.INPUT_REGISTER as ModbusRegisterType,
  registerCount: 1,
  endianness: MODBUS_ENDIANNESS.BIG_ENDIAN as ModbusEndianness,
  unit: "",
  inputMin: 0,
  inputMax: 65535,
  outputMin: 0,
  outputMax: 100,
  offsetVal: 0,
  deadbandThreshold: null as number | null,
});

const form = reactive(makeDefaults());

watch(
  () => props.open,
  (v) => {
    if (v) Object.assign(form, makeDefaults());
  },
);

watch(
  () => props.fixedDeviceId,
  (id) => {
    if (id != null) form.deviceId = id;
  },
  { immediate: true },
);

const deviceOptions = computed(() =>
  props.devices.map((d) => ({
    label: d.name ?? `Device ${d.id}`,
    value: d.id,
  })),
);

const dataTypeOptions = Object.values(TAG_DATA_TYPE).map((v) => ({
  label: v.replace(/_/g, " "),
  value: v,
}));

const registerTypeOptions = Object.values(MODBUS_REGISTER_TYPE).map((v) => ({
  label: v.replace(/_/g, " "),
  value: v,
}));

const endiannessOptions = Object.values(MODBUS_ENDIANNESS).map((v) => ({
  label: v.replace(/_/g, " "),
  value: v,
}));

const canSubmit = computed(() => form.deviceId != null && form.name.trim() !== "");

const handleSubmit = () => {
  if (!canSubmit.value) return;
  emits("submit", {
    deviceId: form.deviceId!,
    portNumber: form.portNumber,
    name: form.name,
    slug: form.slug,
    dataType: formatBackendEnum(form.dataType),
    registerAddress: form.registerAddress,
    registerType: formatBackendEnum(form.registerType),
    registerCount: form.registerCount,
    endianness: formatBackendEnum(form.endianness),
    unit: form.unit,
    inputMin: form.inputMin,
    inputMax: form.inputMax,
    outputMin: form.outputMin,
    outputMax: form.outputMax,
    offsetVal: form.offsetVal,
    deadbandThreshold: form.deadbandThreshold,
    uiConfig: "",
  });
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
        <div class="flex items-center gap-2">
          <UIcon :name="plusIcon" class="size-4 text-muted" />
          <span class="font-semibold text-base">New tag</span>
        </div>

        <USeparator />

        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <UFormField label="Device" class="col-span-2">
            <USelect
              v-model="form.deviceId"
              :items="deviceOptions"
              :disabled="fixedDeviceId != null"
              placeholder="Select a device"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Name">
            <UInput v-model="form.name" placeholder="Tag name" class="w-full" />
          </UFormField>

          <UFormField label="Slug">
            <UInput v-model="form.slug" placeholder="tag_slug" class="w-full" />
          </UFormField>

          <UFormField label="Type">
            <USelect
              v-model="form.dataType"
              :items="dataTypeOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Unit">
            <UInput v-model="form.unit" placeholder="Bar, °C, V…" class="w-full" />
          </UFormField>

          <UFormField label="Port №">
            <UInput v-model="form.portNumber" type="number" class="w-full" />
          </UFormField>

          <USeparator class="col-span-2" label="Modbus Settings" />

          <UFormField label="Register Addr">
            <UInput
              v-model="form.registerAddress"
              type="number"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Register Type">
            <USelect
              v-model="form.registerType"
              :items="registerTypeOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Register Count">
            <UInput
              v-model="form.registerCount"
              type="number"
              min="1"
              max="2"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Endianness">
            <USelect
              v-model="form.endianness"
              :items="endiannessOptions"
              class="w-full"
            />
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

          <UFormField label="Deadband">
            <UInput
              v-model="form.deadbandThreshold"
              type="number"
              placeholder="—"
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
          <UButton
            label="Create"
            :leading-icon="saveIcon"
            :disabled="!canSubmit"
            @click="handleSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
