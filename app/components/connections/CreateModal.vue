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

const HOSTNAME_OR_IP_REGEX =
  /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$|^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const errors = computed(() => {
  const errs: Record<string, string> = {};
  const ip = form.ipAddress.trim();
  if (!ip) {
    errs.ipAddress = "IP address or hostname is required";
  } else if (!HOSTNAME_OR_IP_REGEX.test(ip)) {
    errs.ipAddress = "Invalid IP address or hostname format";
  }
  if (!form.port || form.port < 1 || form.port > 65535) {
    errs.port = "Port must be between 1 and 65535";
  }
  if (form.description && form.description.length > 150) {
    errs.description = "Description cannot exceed 150 characters";
  }
  return errs;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

const handleSubmit = () => {
  if (!isValid.value) return;
  emits("submit", { ...form, ipAddress: form.ipAddress.trim() });
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
          <UFormField label="IP Address / Hostname" :error="form.ipAddress ? errors.ipAddress : undefined" class="col-span-2">
            <UInput
              v-model="form.ipAddress"
              placeholder="192.168.1.100 or plc.local"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Port" :error="errors.port">
            <UInput v-model="form.port" type="number" :min="1" :max="65535" class="w-full" />
          </UFormField>

          <UFormField label="Description" :error="errors.description" class="col-span-2">
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
