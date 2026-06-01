<script lang="ts" setup>
import { paletteIcon, saveIcon } from "~/core/icons-map";
import type { TagSettings, TagUiConfig } from "~/types/models";
import { serializeUiConfig, toUpdateTagDto } from "~/utils/tag";

const props = defineProps<{
  open: boolean;
  tag: TagSettings | null;
}>();

const emits = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const api = useApi();
const notifications = useNotificationsStore();

const isDigital = computed(() => props.tag?.dataType === "DIGITAL");

const form = reactive<TagUiConfig>({
  color: null,
  minCritical: null,
  minWarning: null,
  maxWarning: null,
  maxCritical: null,
  digitalWarning: null,
  digitalCritical: null,
  labelZero: null,
  labelOne: null,
});

watch(
  () => props.tag,
  (t) => {
    const ui = t?.uiConfigJson ?? {};
    form.color = ui.color ?? null;
    form.minCritical = ui.minCritical ?? null;
    form.minWarning = ui.minWarning ?? null;
    form.maxWarning = ui.maxWarning ?? null;
    form.maxCritical = ui.maxCritical ?? null;
    form.digitalWarning = ui.digitalWarning ?? null;
    form.digitalCritical = ui.digitalCritical ?? null;
    form.labelZero = ui.labelZero ?? null;
    form.labelOne = ui.labelOne ?? null;
  },
  { immediate: true },
);

const colorHex = computed({
  get: () => (form.color && /^#[0-9a-fA-F]{6}$/.test(form.color) ? form.color : "#22c55e"),
  set: (v: string) => (form.color = v),
});

const digitalStateItems = [
  { label: "— none", value: null },
  { label: "0 / off", value: 0 },
  { label: "1 / on", value: 1 },
];

const saving = ref(false);

const handleSubmit = async () => {
  const tag = props.tag;
  if (!tag?.tagId) return;
  saving.value = true;
  try {
    await api.tags.update(
      tag.tagId,
      toUpdateTagDto(tag, { uiConfig: serializeUiConfig({ ...form }) }),
    );
    notifications.add("Appearance saved", `Thresholds updated for "${tag.name}"`, "INFO");
    emits("saved");
    emits("update:open", false);
  } catch (e) {
    notifications.add("Save failed", `Could not update "${tag.name}": ${e}`, "CRITICAL");
  } finally {
    saving.value = false;
  }
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
        <!-- Header -->
        <div class="flex items-center gap-2">
          <UIcon :name="paletteIcon" class="size-5 text-primary" />
          <div class="flex flex-col leading-tight">
            <span class="font-semibold text-base">Appearance &amp; thresholds</span>
            <span class="font-mono text-xs text-muted">{{ tag?.name }} · ID {{ tag?.tagId }}</span>
          </div>
        </div>

        <USeparator />

        <!-- Color -->
        <UFormField label="Accent color" help="Overrides the type color on cards and chart">
          <div class="flex items-center gap-2">
            <input
              v-model="colorHex"
              type="color"
              class="size-9 shrink-0 cursor-pointer rounded border border-default bg-transparent"
            >
            <UInput
              v-model="form.color"
              placeholder="#22c55e or var(--color-info-500)"
              class="flex-1 font-mono"
            />
            <UButton
              v-if="form.color"
              icon="ph:x"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="form.color = null"
            />
          </div>
        </UFormField>

        <USeparator :label="isDigital ? 'Digital states' : 'Analog thresholds'" />

        <!-- Analog thresholds -->
        <div v-if="!isDigital" class="grid grid-cols-2 gap-x-4 gap-y-4">
          <UFormField label="Min critical">
            <UInputNumber v-model="form.minCritical" :step="0.1" placeholder="—" class="w-full" />
          </UFormField>
          <UFormField label="Min warning">
            <UInputNumber v-model="form.minWarning" :step="0.1" placeholder="—" class="w-full" />
          </UFormField>
          <UFormField label="Max warning">
            <UInputNumber v-model="form.maxWarning" :step="0.1" placeholder="—" class="w-full" />
          </UFormField>
          <UFormField label="Max critical">
            <UInputNumber v-model="form.maxCritical" :step="0.1" placeholder="—" class="w-full" />
          </UFormField>
        </div>

        <!-- Digital config -->
        <div v-else class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-x-4 gap-y-4">
            <UFormField label="Warning state">
              <USelect
                v-model="form.digitalWarning"
                :items="digitalStateItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Critical state">
              <USelect
                v-model="form.digitalCritical"
                :items="digitalStateItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Label for 0">
              <UInput v-model="form.labelZero" placeholder="OFF" class="w-full" />
            </UFormField>
            <UFormField label="Label for 1">
              <UInput v-model="form.labelOne" placeholder="ON" class="w-full" />
            </UFormField>
          </div>
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
            :loading="saving"
            @click="handleSubmit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
