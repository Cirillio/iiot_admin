<script lang="ts" setup>
import { closeIcon, tagIcon } from "~/core/icons-map";
import {
  TAG_DATA_TYPE,
  type TagSettings,
} from "~/types/models";

const props = defineProps<{
  open: boolean;
  tags: TagSettings[];
  deviceName?: string | null;
}>();

const emit = defineEmits<{
  (e: "update:open", val: boolean): void;
  (e: "edit", tag: TagSettings): void;
}>();

const TAG_GROUPS = [
  {
    label: "Analog",
    color: "info" as const,
    types: [TAG_DATA_TYPE.ANALOG_RAW, TAG_DATA_TYPE.ANALOG_PHYSICAL],
  },
  {
    label: "Digital",
    color: "success" as const,
    types: [TAG_DATA_TYPE.DIGITAL],
  },
] as const;

const tagsByGroup = computed(() =>
  Object.fromEntries(
    TAG_GROUPS.map(({ label, types }) => [
      label,
      props.tags.filter((t) => t.dataType && types.includes(t.dataType as never)),
    ]),
  ) as Record<string, TagSettings[]>,
);

const groupTags = (label: string): TagSettings[] =>
  tagsByGroup.value[label] ?? [];

const close = () => emit("update:open", false);

const handleEdit = (tag: TagSettings) => {
  emit("edit", tag);
  close();
};
</script>

<template>
  <UModal
    :open="open"
    fullscreen
    :ui="{ content: 'flex flex-col' }"
    @update:open="emit('update:open', $event)"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center gap-3 w-full">
        <UIcon :name="tagIcon" class="size-5 text-muted" />
        <span class="font-semibold text-base">
          {{ deviceName ?? "Device" }} — All Tags
        </span>
        <UBadge color="neutral" variant="outline" size="sm" class="font-mono">
          {{ tags.length }}
        </UBadge>
        <UButton
          :icon="closeIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          class="ml-auto"
          @click="close"
        />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <div class="flex-1 min-h-0 overflow-y-auto p-6">
        <div class="grid grid-cols-2 gap-8">
          <div
            v-for="group in TAG_GROUPS"
            :key="group.label"
            class="flex flex-col gap-3"
          >
            <!-- Group header -->
            <div class="flex items-center gap-2 pb-2 border-b border-default">
              <span
                class="text-sm font-bold uppercase tracking-widest text-default/70"
              >
                {{ group.label }}
              </span>
              <UBadge :color="group.color" variant="subtle" size="sm">
                {{ groupTags(group.label).length }}
              </UBadge>
            </div>

            <!-- Cards grid -->
            <div
              v-if="groupTags(group.label).length > 0"
              class="flex flex-col gap-1.5"
            >
              <DevicesTagCardCompact
                v-for="tag in groupTags(group.label)"
                :key="tag.tagId"
                :item="tag"
                @edit="handleEdit"
              />
            </div>
            <div
              v-else
              class="rounded-lg border border-dashed border-default/30 py-12 flex items-center justify-center"
            >
              <span class="text-xs text-muted/40">No tags</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
