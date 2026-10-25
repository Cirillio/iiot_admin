<script lang="ts" setup>
import { saveIcon } from "~/core/icons-map";
import {
  MODBUS_ENDIANNESS,
  MODBUS_REGISTER_TYPE,
  type ModbusEndianness,
  type ModbusRegisterType,
  TAG_DATA_TYPE,
  type TagDataType,
  type TagSettings,
} from "~/types/models";

const props = defineProps<{
  open: boolean;
  tag: TagSettings | null;
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: Partial<TagSettings>): void;
}>();

const form = reactive<{
  name: string;
  slug: string;
  dataType: TagDataType | undefined;
  unit: string;
  portNumber: number;
  registerAddress: number;
  registerType: ModbusRegisterType | undefined;
  registerCount: number;
  endianness: ModbusEndianness | undefined;
  inputMin: number;
  inputMax: number;
  outputMin: number;
  outputMax: number;
  offsetVal: number;
  deadbandThreshold: number | null;
}>({
  name: "",
  slug: "",
  dataType: undefined,
  unit: "",
  portNumber: 0,
  registerAddress: 0,
  registerType: undefined,
  registerCount: 1,
  endianness: undefined,
  inputMin: 0,
  inputMax: 65535,
  outputMin: 0,
  outputMax: 100,
  offsetVal: 0,
  deadbandThreshold: null,
});

watch(
  () => props.tag,
  (t) => {
    if (!t) return;
    form.name = t.name ?? "";
    form.slug = t.slug ?? "";
    form.dataType = t.dataType ?? undefined;
    form.unit = t.unit ?? "";
    form.portNumber = t.portNumber ?? 0;
    form.registerAddress = t.registerAddress ?? 0;
    form.registerType = t.registerType ?? "INPUT_REGISTER";
    form.registerCount = t.registerCount ?? 1;
    form.endianness = t.endianness ?? "BIG_ENDIAN";
    form.inputMin = t.inputMin ?? 0;
    form.inputMax = t.inputMax ?? 65535;
    form.outputMin = t.outputMin ?? 0;
    form.outputMax = t.outputMax ?? 100;
    form.offsetVal = t.offsetVal ?? 0;
    form.deadbandThreshold = t.deadbandThreshold ?? null;
  },
  { immediate: true },
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

const SLUG_REGEX = /^[a-z0-9_]+$/;

const errors = computed(() => {
  const errs: Record<string, string> = {};
  if (!form.name.trim()) {
    errs.name = "Tag name is required";
  } else if (form.name.length > 100) {
    errs.name = "Tag name cannot exceed 100 characters";
  }

  if (!form.slug.trim()) {
    errs.slug = "Slug is required";
  } else if (form.slug.length > 50) {
    errs.slug = "Slug cannot exceed 50 characters";
  } else if (!SLUG_REGEX.test(form.slug.trim())) {
    errs.slug = "Only lowercase letters, numbers, and underscores";
  }

  if (form.portNumber < 0 || form.portNumber > 65535) {
    errs.portNumber = "Port number must be 0–65535";
  }

  if (form.registerAddress < 0 || form.registerAddress > 65535) {
    errs.registerAddress = "Register address must be 0–65535";
  }

  if (form.registerCount < 1 || form.registerCount > 125) {
    errs.registerCount = "Register count must be 1–125";
  }

  return errs;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

const handleSubmit = () => {
  if (!isValid.value) return;
  emits("submit", {
    ...form,
    name: form.name.trim(),
    slug: form.slug.trim(),
    unit: form.unit.trim(),
  });
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
          <span class="font-semibold text-base">Edit tag</span>
          <span class="font-mono text-xs text-muted"
            >ID: {{ tag?.tagId }}</span
          >
        </div>

        <USeparator />

        <!-- Form -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <UFormField label="Name" :error="form.name ? errors.name : undefined" class="col-span-2">
            <UInput
              v-model="form.name"
              placeholder="Tag name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Slug" :error="form.slug ? errors.slug : undefined">
            <UInput
              v-model="form.slug"
              placeholder="tag_slug"
              font-mono
              class="w-full"
            />
          </UFormField>

          <UFormField label="Type">
            <USelect
              v-model="form.dataType"
              :items="dataTypeOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Unit">
            <UInput
              v-model="form.unit"
              placeholder="Bar, °C, V…"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Port №" :error="errors.portNumber">
            <UInput v-model="form.portNumber" type="number" :min="0" :max="65535" class="w-full" />
          </UFormField>

          <USeparator class="col-span-2" label="Modbus Settings" />

          <UFormField label="Register Addr" :error="errors.registerAddress">
            <UInput
              v-model="form.registerAddress"
              type="number"
              :min="0"
              :max="65535"
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

          <UFormField label="Register Count" :error="errors.registerCount">
            <UInput
              v-model="form.registerCount"
              type="number"
              :min="1"
              :max="125"
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

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="emits('update:open', false)"
          />
          <UButton
            label="Save"
            :leading-icon="saveIcon"
            :disabled="!isValid"
            @click="handleSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
