<template>
  <UPopover
    v-model:open="popoverOpen"
    :content="{
      side: 'left',
      align: 'end',
    }"
    :ui="{
      content:
        'bg-default/80 backdrop-blur-xs hover:ring-inverted/50 transition duration-75 ring-accented/75',
    }"
  >
    <UButton :icon="infoIcon" size="sm" variant="soft" color="neutral" />

    <template #content>
      <div
        class="grid text-default/75 text-xs grid-cols-[2fr_1fr] gap-x-4 gap-y-2 p-2"
      >
        <span>input_min</span>
        <span class="text-default text-end">{{ item.inputMin }}</span>

        <span>input_max</span>
        <span class="text-default text-end">{{ item.inputMax }}</span>

        <span>output_min</span>
        <span class="text-default text-end">{{ item.outputMin }}</span>

        <span>output_max</span>
        <span class="text-default text-end">{{ item.outputMax }}</span>

        <span>offset</span>
        <span class="text-default text-end">{{ item.offsetVal }}</span>
      </div>
      <div class="flex p-2">
        <UButton
          :leading-icon="setupsIsCopied ? copyCheckIcon : copyIcon"
          label="copy"
          variant="ghost"
          size="xs"
          color="neutral"
          block
          @click="handleCopyTagValueSetups"
        />
      </div>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import { copyCheckIcon, copyIcon, infoIcon } from "~/core/icons-map";
import { extractErrorMessage } from "~/utils/error";

type TagValueSetup = {
  inputMin?: number;
  inputMax?: number;
  outputMin?: number;
  outputMax?: number;
  offsetVal?: number;
};

const popoverOpen = ref(false);
const setupsIsCopied = ref(false);

const props = defineProps<{ item: TagValueSetup }>();

const notifications = useNotificationsStore();

const handleCopyTagValueSetups = async () => {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API not available in this context");
    }
    await navigator.clipboard.writeText(JSON.stringify(props.item, null, 2));
    setupsIsCopied.value = true;
    notifications.add("Copied", "Tag value setups copied to clipboard", "INFO");
  } catch (err) {
    notifications.add(
      "Copy failed",
      extractErrorMessage(err, "Failed to copy to clipboard"),
      "WARNING",
    );
  }
};

const popoverCopyWatch = watch(
  popoverOpen,
  (val) => {
    if (val) {
      setupsIsCopied.value = false;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  popoverCopyWatch();
});
</script>
