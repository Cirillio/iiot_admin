<script lang="ts" setup>
import { closeIcon, reloadIcon, searchIcon } from "~/core/icons-map";
import type { SensorDataType } from "~/types/models";
import { SENSOR_DATA_TYPE, SENSOR_TYPE_COLOR } from "~/types/models";

definePageMeta({
  title: "Sensors",
  description: "All registered sensors across devices",
});

const api = useApi();
const { values: metricsValues } = storeToRefs(useRealTimeStore());

const { data, pending, refresh } = useAsyncData(
  "sensors",
  () => api.sensors.list(),
  { immediate: true },
);

const search = ref("");
const activeTypes = ref<Set<SensorDataType>>(new Set());

const ALL_TYPES = Object.values(SENSOR_DATA_TYPE) as SensorDataType[];

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

const PAGE_SIZE = 25;
const page = ref(1);

watch([search, activeTypes], () => { page.value = 1; });

const paginatedSensors = computed(() =>
  filteredSensors.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);

const showPagination = computed(() => filteredSensors.value.length > PAGE_SIZE);

const toast = useToast();

const handleDelete = async (id: number | undefined) => {
  if (id === undefined) return;
  await api.sensors.delete(id);
  toast.add({
    title: `Sensor "${data.value?.find((v) => v.sensorId === id)?.name}" deleted`,
    color: "error",
  });
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
          :label="SENSOR_DATA_TYPE[t]"
          :color="activeTypes.has(t) ? SENSOR_TYPE_COLOR[t] : 'neutral'"
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
    <SensorsListTable
      :data="paginatedSensors"
      :sensor-metrics="metricsValues"
      @delete:sensor="handleDelete"
      @refresh="refresh"
    />

    <div v-if="showPagination" class="flex justify-center py-3 border-t border-default shrink-0">
      <UPagination
        v-model:page="page"
        :total="filteredSensors.length"
        :items-per-page="PAGE_SIZE"
        size="sm"
      />
    </div>
  </div>
</template>
