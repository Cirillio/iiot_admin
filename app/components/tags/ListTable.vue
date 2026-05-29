<script lang="ts" setup>
import { deleteIcon, editIcon } from "~/core/icons-map";
import type { Metric } from "~/types/api";
import {
  type Device,
  type TagSettings,
  TAG_DATA_TYPE,
  TAG_TYPE_COLOR,
} from "~/types/models";

interface Props {
  data: TagSettings[];
  devices?: Device[];
  tagMetrics: Map<number, Metric>;
  hiddenColumns?: string[];
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "delete:tag", value: number | undefined): void;
  (e: "refresh"): void;
}>();

const api = useApi();
const toast = useToast();

const ALL_COLUMNS = [
  { accessorKey: "name", header: "Name / Slug" },
  { accessorKey: "dataType", header: "Type" },
  { id: "device", header: "Device / Port" },
  { accessorKey: "unit", header: "Val / Unit" },
  { accessorKey: "updatedAt", header: "Updated" },
  { id: "actions", header: "Actions" },
];

const columns = computed(() =>
  props.hiddenColumns?.length
    ? ALL_COLUMNS.filter(
        (c) => !props.hiddenColumns!.includes((c as any).accessorKey ?? c.id),
      )
    : ALL_COLUMNS,
);

const getTagMetricValue = (tagId: number) => {
  const val = props.tagMetrics.get(tagId)?.value;
  if (val === undefined) return null;
  if (val === 1 || val === 0) return val.toFixed(1);
  return val?.toFixed(3);
};

const targetTag = ref<TagSettings | null>(null);
const deleteModalOpen = ref(false);
const editModalOpen = ref(false);

const openDelete = (tag: TagSettings) => {
  targetTag.value = tag;
  deleteModalOpen.value = true;
};

const openEdit = (tag: TagSettings) => {
  targetTag.value = tag;
  editModalOpen.value = true;
};

const handleDeleteConfirm = () => {
  emits("delete:tag", targetTag.value?.tagId);
  deleteModalOpen.value = false;
  targetTag.value = null;
};

const handleEditSubmit = async (dto: Partial<TagSettings>) => {
  const id = targetTag.value?.tagId;
  if (!id) return;
  try {
    await api.tags.update(id, {
      portNumber: dto.portNumber ?? undefined,
      name: dto.name,
      slug: dto.slug,
      dataType: formatBackendEnum(dto.dataType),
      registerAddress: dto.registerAddress,
      registerType: formatBackendEnum(dto.registerType),
      registerCount: dto.registerCount,
      unit: dto.unit,
      inputMin: dto.inputMin,
      inputMax: dto.inputMax,
      outputMin: dto.outputMin,
      outputMax: dto.outputMax,
      offsetVal: dto.offsetVal,
      formula: dto.formula,
      endianness: dto.endianness,
      deadbandThreshold: dto.deadbandThreshold,
      uiConfig: dto.uiConfigJson ? JSON.stringify(dto.uiConfigJson) : "",
    });
    toast.add({ title: "Tag updated", color: "success" });
    emits("refresh");
  } catch {
    toast.add({ title: "Failed to update tag", color: "error" });
  } finally {
    editModalOpen.value = false;
    targetTag.value = null;
  }
};
</script>

<template>
  <TagsDeleteModal
    :open="deleteModalOpen"
    :tag-name="targetTag?.name"
    @update:open="deleteModalOpen = $event"
    @confirm="handleDeleteConfirm"
  />
  <TagsEditModal
    :open="editModalOpen"
    :tag="targetTag"
    @update:open="editModalOpen = $event"
    @submit="handleEditSubmit"
  />
  <UTable
    :data="data"
    :columns="columns"
    class="w-full"
    sticky
    :ui="{
      separator: 'bg-border',
      tr: 'hover:bg-muted/50 border-b! border-b-default hover:border-tertiary/50 transition duration-75 ease-out',
    }"
  >
    <template #name-cell="{ row }">
      <div class="flex items-center gap-4">
        <span>{{ row.index + 1 }}</span>
        <div class="flex flex-col gap-0.5">
          <NuxtLink
            :to="'/tags/' + row.original.tagId"
            class="font-semibold text-default w-fit hover:text-tertiary font-mono text-sm"
            >{{ row.original.name ?? "—" }}</NuxtLink
          >
          <span class="text-xs font-mono text-muted">{{
            row.original.slug ?? "—"
          }}</span>
        </div>
      </div>
    </template>

    <template #dataType-cell="{ row }">
      <UBadge
        v-if="row.original.dataType"
        :color="TAG_TYPE_COLOR[row.original.dataType]"
        :label="TAG_DATA_TYPE[row.original.dataType]"
        variant="soft"
        size="sm"
      />
    </template>

    <template #device-cell="{ row }">
      <div class="flex flex-col gap-0.5 font-mono text-xs">
        <span class="font-semibold truncate">{{
          devices?.find((i) => i.id == row.original.deviceId)?.name ?? "—"
        }}</span>
        <span class="text-muted truncate"
          >port
          <span class="font-semibold">{{
            row.original.portNumber ?? "—"
          }}</span></span
        >
      </div>
    </template>

    <template #unit-cell="{ row }">
      <div class="flex items-center gap-2">
        <TagsValSetupsPopover
          :item="{
            inputMin: row.original.inputMin,
            inputMax: row.original.inputMax,
            outputMin: row.original.outputMin,
            outputMax: row.original.outputMax,
            offsetVal: row.original.offsetVal,
            formula: row.original.formula,
          }"
        />
        <div class="flex flex-col items-start">
          <span
            v-if="
              row.original.tagId !== undefined &&
              getTagMetricValue(row.original.tagId)
            "
            class="text-xs text-tertiary"
          >
            {{ getTagMetricValue(row.original.tagId) ?? "-" }}
          </span>
          <span class="text-sm">{{ row.original.unit || "—" }}</span>
        </div>
      </div>
    </template>

    <template #updatedAt-cell="{ row }">
      <span v-if="row.original.updatedAt" class="text-xs text-muted">
        {{ new Date(row.original.updatedAt).toLocaleString().split(",")[0] }}
        <br />
        {{ new Date(row.original.updatedAt).toLocaleString().split(",")[1] }}
      </span>
      <span v-else class="text-xs text-muted"> — </span>
    </template>

    <template #actions-cell="{ row }">
      <div class="flex gap-1">
        <UButton
          :icon="editIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="openEdit(row.original)"
        />
        <UButton
          :icon="deleteIcon"
          variant="ghost"
          color="error"
          size="sm"
          @click="openDelete(row.original)"
        />
      </div>
    </template>
  </UTable>
</template>
