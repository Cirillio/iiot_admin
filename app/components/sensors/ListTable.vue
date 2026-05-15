<script lang="ts" setup>
import { deleteIcon, editIcon } from "~/core/icons-map";
import type { Metric } from "~/types/api";
import {
  type SensorSettings,
  SENSOR_DATA_TYPE,
  SENSOR_TYPE_COLOR,
} from "~/types/models";

interface Props {
  data: SensorSettings[];
  sensorMetrics: Map<number, Metric>;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "delete:sensor", value: number | undefined): void;
  (e: "refresh"): void;
}>();

const api = useApi();
const toast = useToast();

const columns = [
  { accessorKey: "name", header: "Name / Slug" },
  { accessorKey: "dataType", header: "Type" },
  { id: "device", header: "Device / Port" },
  { accessorKey: "unit", header: "Val / Unit" },
  { accessorKey: "updatedAt", header: "Updated" },
  { id: "actions", header: "Actions" },
];

const getSensorMetricValue = (sensorId: number) => {
  const val = props.sensorMetrics.get(sensorId)?.value;
  if (val === undefined) return null;
  if (val === 1 || val === 0) return val.toFixed(1);
  return val?.toFixed(3);
};

const targetSensor = ref<SensorSettings | null>(null);
const deleteModalOpen = ref(false);
const editModalOpen = ref(false);

const openDelete = (sensor: SensorSettings) => {
  targetSensor.value = sensor;
  deleteModalOpen.value = true;
};

const openEdit = (sensor: SensorSettings) => {
  targetSensor.value = sensor;
  editModalOpen.value = true;
};

const handleDeleteConfirm = () => {
  emits("delete:sensor", targetSensor.value?.sensorId);
  deleteModalOpen.value = false;
  targetSensor.value = null;
};

const handleEditSubmit = async (dto: Partial<SensorSettings>) => {
  const id = targetSensor.value?.sensorId;
  if (!id) return;
  try {
    await api.sensors.update(id, {
      name: dto.name,
      slug: dto.slug,
      dataType: dto.dataType,
      unit: dto.unit,
      portNumber: dto.portNumber,
    });
    toast.add({ title: "Sensor updated", color: "success" });
    emits("refresh");
  } catch {
    toast.add({ title: "Failed to update sensor", color: "error" });
  } finally {
    editModalOpen.value = false;
    targetSensor.value = null;
  }
};
</script>

<template>
  <SensorsDeleteModal
    :open="deleteModalOpen"
    :sensor-name="targetSensor?.name"
    @update:open="deleteModalOpen = $event"
    @confirm="handleDeleteConfirm"
  />
  <SensorsEditModal
    :open="editModalOpen"
    :sensor="targetSensor"
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
            :to="'/sensor/' + row.original.slug"
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
        :color="SENSOR_TYPE_COLOR[row.original.dataType]"
        :label="SENSOR_DATA_TYPE[row.original.dataType]"
        variant="soft"
        size="sm"
      />
    </template>

    <template #device-cell="{ row }">
      <div class="flex flex-col gap-0.5 font-mono text-xs">
        <span
          >dev
          <span class="font-semibold">{{
            row.original.deviceId ?? "—"
          }}</span></span
        >
        <span class="text-muted"
          >port
          <span class="font-semibold">{{
            row.original.portNumber ?? "—"
          }}</span></span
        >
      </div>
    </template>

    <template #unit-cell="{ row }">
      <div class="flex items-center gap-2">
        <SensorsValSetupsPopover
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
              row.original.sensorId !== undefined &&
              getSensorMetricValue(row.original.sensorId)
            "
            class="text-xs text-tertiary"
          >
            {{ getSensorMetricValue(row.original.sensorId) ?? "-" }}
          </span>
          <span class="text-sm">{{ row.original.unit || "—" }}</span>
        </div>
      </div>
    </template>

    <template #updatedAt-cell="{ row }">
      <span class="text-xs text-muted">
        {{
          row.original.updatedAt
            ? new Date(row.original.updatedAt).toLocaleString().replace(",", "")
            : "—"
        }}
      </span>
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
