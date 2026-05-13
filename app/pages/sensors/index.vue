<script lang="ts" setup>
import {
  closeIcon,
  deleteIcon,
  reloadIcon,
  searchIcon,
} from "~/core/icons-map";
import type { SensorDataType, SensorSettings } from "~/types/models";
import { SENSOR_DATA_TYPE } from "~/types/models";

definePageMeta({
  title: "Sensors",
  description: "All registered sensors across devices",
});

const api = useApi();
const { values: metricsValues } = storeToRefs(useRealTimeStore());

const getSensorMetricValue = (sensorId: number) => {
  const val = metricsValues.value.get(sensorId)?.Value;
  if (val === undefined) return null;
  if (val === 1 || val === 0) return val.toFixed(1);
  return val?.toFixed(3);
};

const { data, pending, refresh } = useAsyncData(
  "sensors",
  () => api.sensors.list(),
  { immediate: true },
);

const search = ref("");
const activeTypes = ref<Set<SensorDataType>>(new Set());

const ALL_TYPES = Object.values(SENSOR_DATA_TYPE) as SensorDataType[];

const TYPE_COLOR: Record<SensorDataType, "info" | "success" | "warning"> = {
  ANALOG: "info",
  DIGITAL: "success",
  VIRTUAL: "warning",
};

const TYPE_LABEL: Record<SensorDataType, string> = {
  ANALOG: "Analog",
  DIGITAL: "Digital",
  VIRTUAL: "Virtual",
};

const filteredSensors = computed(() => {
  let result = data.value ?? [];

  if (activeTypes.value.size > 0)
    result = result.filter(
      (s) => s.dataType !== undefined && activeTypes.value.has(s.dataType),
    );

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    result = result.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q),
    );
  }

  return result;
});

const toggleType = (t: SensorDataType) => {
  const next = new Set(activeTypes.value);
  if (next.has(t)) next.delete(t);
  else next.add(t);
  activeTypes.value = next;
};

const columns = [
  { accessorKey: "name", header: "Name / Slug" },
  { accessorKey: "dataType", header: "Type" },
  { id: "device", header: "Device / Port" },
  { accessorKey: "unit", header: "Val / Unit" },
  { accessorKey: "updatedAt", header: "Updated" },
  { id: "actions", header: "" },
];

const toast = useToast();

const handleDelete = async (sensor: SensorSettings) => {
  if (sensor.sensorId === undefined) return;
  await api.sensors.delete(sensor.sensorId);
  toast.add({ title: `Sensor "${sensor.name}" deleted`, color: "error" });
  await refresh();
};
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-3 border-b border-default p-4 shrink-0">
      <UInput
        v-model="search"
        :leading-icon="searchIcon"
        placeholder="Search by name or slug..."
        size="md"
        class="w-64"
        :ui="{ trailing: 'pr-1' }"
      >
        <template v-if="search" #trailing>
          <UButton
            :icon="closeIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            @click="search = ''"
          />
        </template>
      </UInput>

      <div class="flex gap-1.5">
        <UButton
          v-for="t in ALL_TYPES"
          :key="t"
          :label="TYPE_LABEL[t]"
          :color="activeTypes.has(t) ? TYPE_COLOR[t] : 'neutral'"
          :variant="activeTypes.has(t) ? 'soft' : 'outline'"
          size="md"
          @click="toggleType(t)"
        />
      </div>

      <div class="ml-auto flex items-center gap-3">
        <UBadge
          color="neutral"
          variant="outline"
          size="lg"
          :label="`${filteredSensors.length} / ${data?.length ?? 0} sensors`"
        />
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="md"
          :disabled="pending"
          @click="refresh()"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <UTable
        :data="[...filteredSensors, ...filteredSensors]"
        :columns="columns"
        class="w-full"
        :ui="{
          separator: 'bg-border/0',
          tr: 'hover:bg-muted/50 border-b! border-b-default hover:border-tertiary/50 transition duration-75 ease-out',
        }"
      >
        <template #name-cell="{ row }">
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
        </template>

        <template #dataType-cell="{ row }">
          <UBadge
            v-if="row.original.dataType"
            :color="TYPE_COLOR[row.original.dataType]"
            :label="TYPE_LABEL[row.original.dataType]"
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
        </template>

        <template #updatedAt-cell="{ row }">
          <span class="text-xs text-muted">
            {{
              row.original.updatedAt
                ? new Date(row.original.updatedAt)
                    .toLocaleString()
                    .replace(",", "")
                : "—"
            }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            :icon="deleteIcon"
            variant="ghost"
            color="error"
            size="sm"
            @click="handleDelete(row.original)"
          />
        </template>
      </UTable>
    </div>
  </div>
</template>
