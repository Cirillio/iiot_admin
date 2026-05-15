<script lang="ts" setup>
import {
  arrowLeftIcon,
  binaryIcon,
  calendarIcon,
  deleteIcon,
  editIcon,
  gatewayIcon,
  hashIcon,
  plugIcon,
  reloadIcon,
  sensorIcon,
} from "~/core/icons-map";
import {
  SENSOR_DATA_TYPE,
  SENSOR_TYPE_COLOR,
  type Device,
  type SensorDataType,
  type SensorSettings,
  type UpdateDeviceDto,
} from "~/types/models";

const api = useApi();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const deviceId = Number(route.params.id);

const { data, error, pending, refresh } = useAsyncData(
  `device-${deviceId}`,
  () => api.devices.getById(deviceId),
  { immediate: true },
);

const device = computed<Device>(() => {
  const { sensors, ...rest } = data.value || {};
  return rest as Device;
});

const sensors = computed<SensorSettings[]>(() => data.value?.sensors ?? []);

const SENSOR_GROUPS = [
  { type: SENSOR_DATA_TYPE.ANALOG,  label: "Analog" },
  { type: SENSOR_DATA_TYPE.DIGITAL, label: "Digital" },
  { type: SENSOR_DATA_TYPE.VIRTUAL, label: "Virtual" },
] as const;

const sensorsByType = computed(() =>
  Object.fromEntries(
    SENSOR_GROUPS.map(({ type }) => [
      type,
      sensors.value.filter((s) => s.dataType === type),
    ]),
  ) as Record<SensorDataType, SensorSettings[]>,
);

// --- Device edit/delete ---

const editOpen = ref(false);
const deleteOpen = ref(false);

const handleDeviceUpdate = async (dto: UpdateDeviceDto) => {
  try {
    await api.devices.update(deviceId, dto);
    await refresh();
    toast.add({ title: "Device updated", color: "success" });
  } catch {
    toast.add({ title: "Failed to update device", color: "error" });
  }
};

const handleDeviceDelete = async () => {
  try {
    await api.devices.delete(deviceId);
    toast.add({ title: "Device deleted", color: "success" });
    router.push("/devices");
  } catch {
    toast.add({ title: "Failed to delete device", color: "error" });
  }
};

// --- Sensor edit ---

const sensorEditOpen = ref(false);
const selectedSensor = ref<SensorSettings | null>(null);

const openSensorEdit = (sensor: SensorSettings) => {
  selectedSensor.value = sensor;
  sensorEditOpen.value = true;
};

const handleSensorUpdate = async (dto: Partial<SensorSettings>) => {
  if (!selectedSensor.value?.sensorId) return;
  try {
    await api.sensors.update(selectedSensor.value.sensorId, {
      name: dto.name,
      slug: dto.slug,
      dataType: dto.dataType,
      unit: dto.unit,
      portNumber: dto.portNumber,
    });
    await refresh();
    toast.add({ title: "Sensor updated", color: "success" });
  } catch {
    toast.add({ title: "Failed to update sensor", color: "error" });
  }
};

// --- Utils ---

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

definePageMeta({
  title: "Device Page",
  description: "Management and monitoring of device connected to IIoT",
});
</script>

<template>
  <div class="overflow-hidden w-full h-full flex flex-col">

    <!-- Modals -->
    <DevicesEditModal
      v-model:open="editOpen"
      :device="device"
      @submit="handleDeviceUpdate"
    />
    <DevicesDeleteModal
      v-model:open="deleteOpen"
      :device-name="device?.name"
      @confirm="handleDeviceDelete"
    />
    <SensorsEditModal
      v-model:open="sensorEditOpen"
      :sensor="selectedSensor"
      @submit="handleSensorUpdate"
    />

    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-default shrink-0">
      <div class="flex items-center gap-1.5">
        <UButton
          :icon="arrowLeftIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          title="Back to devices"
          to="/devices"
        />
        <UButton
          :icon="reloadIcon"
          variant="outline"
          color="neutral"
          size="sm"
          title="Refresh"
          :disabled="pending"
          @click="refresh()"
        />
      </div>
      <div class="flex items-center gap-2">
        <UButton
          :leading-icon="editIcon"
          label="Edit"
          variant="outline"
          color="neutral"
          size="sm"
          @click="editOpen = true"
        />
        <UButton
          :leading-icon="deleteIcon"
          label="Delete"
          variant="outline"
          color="error"
          size="sm"
          @click="deleteOpen = true"
        />
      </div>
    </div>

    <!-- Device config card -->
    <div class="px-4 pt-4 pb-3 border-b border-default shrink-0">
      <div class="flex items-start gap-3 mb-3">
        <!-- Status dot -->
        <div class="mt-1.5 shrink-0">
          <span
            class="block size-2.5 rounded-full"
            :class="device?.isActive ? 'bg-success-500 shadow-[0_0_6px_var(--color-success-500)]' : 'bg-neutral-500'"
          />
        </div>
        <h1 class="text-2xl font-bold font-mono leading-tight bg-amber-200 text-black px-1 w-fit">
          {{ device?.name ?? "Loading…" }}
        </h1>
      </div>

      <!-- Config stats row -->
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 pl-5">
        <div v-if="device?.ipAddress" class="flex items-center gap-1.5 text-xs">
          <UIcon :name="gatewayIcon" class="size-3.5 text-muted shrink-0" />
          <span class="text-muted">Address</span>
          <span class="font-mono text-tertiary">{{ device.ipAddress }}:{{ device.port }}</span>
        </div>

        <div v-if="device?.slaveId != null" class="flex items-center gap-1.5 text-xs">
          <UIcon :name="binaryIcon" class="size-3.5 text-muted shrink-0" />
          <span class="text-muted">Slave ID</span>
          <span class="font-mono text-tertiary">{{ device.slaveId }}</span>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <UIcon :name="sensorIcon" class="size-3.5 text-muted shrink-0" />
          <span class="text-muted">Sensors</span>
          <span class="font-mono text-tertiary">{{ sensors.length }}</span>
        </div>

        <div v-if="device?.id" class="flex items-center gap-1.5 text-xs">
          <UIcon :name="hashIcon" class="size-3.5 text-muted shrink-0" />
          <span class="text-muted">ID</span>
          <span class="font-mono text-tertiary">{{ device.id }}</span>
        </div>

        <div v-if="device?.createdAt" class="flex items-center gap-1.5 text-xs">
          <UIcon :name="calendarIcon" class="size-3.5 text-muted shrink-0" />
          <span class="text-muted">Added</span>
          <span class="font-mono text-tertiary">{{ formatDate(device.createdAt) }}</span>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <UIcon :name="plugIcon" class="size-3.5 text-muted shrink-0" />
          <span
            class="font-mono"
            :class="device?.isActive ? 'text-success-400' : 'text-muted'"
          >
            {{ device?.isActive ? "Active" : "Inactive" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Sensors columns -->
    <div class="flex-1 min-h-0 overflow-hidden p-4">
      <ScrollableWrapper>
        <div class="grid grid-cols-3 gap-5 items-start">
          <div
            v-for="group in SENSOR_GROUPS"
            :key="group.type"
            class="flex flex-col gap-2.5"
          >
            <!-- Column header -->
            <div class="flex items-center gap-2 pb-1 border-b border-default">
              <span class="text-xs font-semibold uppercase tracking-widest text-muted">
                {{ group.label }}
              </span>
              <UBadge
                :color="SENSOR_TYPE_COLOR[group.type]"
                variant="subtle"
                size="xs"
              >
                {{ sensorsByType[group.type].length }}
              </UBadge>
            </div>

            <!-- Sensor cards -->
            <template v-if="sensorsByType[group.type].length > 0">
              <DevicesSensorCard
                v-for="sensor in sensorsByType[group.type]"
                :key="sensor.sensorId"
                :item="sensor"
                @edit="openSensorEdit"
              />
            </template>
            <div v-else class="rounded-lg border border-dashed border-default/40 p-4 text-center">
              <span class="text-xs text-muted/50">No sensors</span>
            </div>
          </div>
        </div>
      </ScrollableWrapper>
    </div>

  </div>
</template>
