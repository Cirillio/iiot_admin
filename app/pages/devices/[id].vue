<script lang="ts" setup>
import {
  arrowLeftIcon,
  binaryIcon,
  calendarIcon,
  deleteIcon,
  editIcon,
  gatewayIcon,
  hashIcon,
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

definePageMeta({
  title: "Device",
  description: "Device monitoring and sensor management",
});

const api = useApi();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const rt = useRealTimeStore();

const deviceId = Number(route.params.id);

const { data, pending, refresh } = useAsyncData(
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
  { type: SENSOR_DATA_TYPE.ANALOG, label: "Analog" },
  { type: SENSOR_DATA_TYPE.DIGITAL, label: "Digital" },
  { type: SENSOR_DATA_TYPE.VIRTUAL, label: "Virtual" },
] as const;

const sensorsByType = computed(
  () =>
    Object.fromEntries(
      SENSOR_GROUPS.map(({ type }) => [
        type,
        sensors.value.filter((s) => s.dataType === type),
      ]),
    ) as Record<SensorDataType, SensorSettings[]>,
);

const typeCountLabel = (type: SensorDataType) =>
  sensorsByType.value[type].length;

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

const formatDate = (s?: string) =>
  s
    ? new Date(s).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- ─── Modals ─────────────────────────────────────────────────── -->
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

    <!-- Nav -->
    <div
      class="flex items-center justify-between px-3 py-2.5 border-b border-default shrink-0"
    >
      <div class="flex items-center gap-1">
        <UButton
          :icon="arrowLeftIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          to="/devices"
        />
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="pending"
          @click="refresh()"
        />
      </div>

      <!-- Device name -->
      <h1 class="text-2xl font-bold font-mono leading-tight wrap-break-word">
        {{ device?.name ?? "—" }}
      </h1>

      <UBadge
        :color="rt.isConnected ? 'success' : 'neutral'"
        variant="subtle"
        size="xs"
        class="font-mono uppercase tracking-widest"
      >
        {{ rt.isConnected ? "live" : "offline" }}
      </UBadge>
    </div>

    <div class="flex h-full">
      <!-- ─── Left panel: Sensors ──────────────────────────────────── -->
      <div class="flex-3 min-w-0 flex flex-col overflow-hidden">
        <!-- Sensors header -->
        <div
          class="flex items-center gap-2 px-4 py-2.5 border-b border-default shrink-0"
        >
          <UIcon :name="sensorIcon" class="size-4 text-muted" />
          <span class="text-sm font-semibold">Connected Sensors</span>
          <UBadge color="neutral" variant="outline" size="xs" class="font-mono">
            {{ sensors.length }}
          </UBadge>
        </div>

        <!-- Columns -->
        <ScrollableWrapper>
          <div class="grid grid-cols-3 gap-4 p-4 items-start">
            <div
              v-for="group in SENSOR_GROUPS"
              :key="group.type"
              class="flex flex-col gap-2.5"
            >
              <!-- Column header -->
              <div class="flex items-center gap-2 pb-2 border-b border-default">
                <span
                  class="text-xs font-bold uppercase tracking-widest text-muted"
                >
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

              <!-- Cards -->
              <template v-if="sensorsByType[group.type].length > 0">
                <DevicesSensorCard
                  v-for="sensor in sensorsByType[group.type]"
                  :key="sensor.sensorId"
                  :item="sensor"
                  @edit="openSensorEdit"
                />
              </template>
              <div
                v-else
                class="rounded-lg border border-dashed border-default/30 py-8 flex items-center justify-center"
              >
                <span class="text-xs text-muted/40">No sensors</span>
              </div>
            </div>
          </div>
        </ScrollableWrapper>
      </div>

      <!-- Right panel: Device details-->
      <div
        class="flex-1 min-h-0 border-l border-default overflow-y-auto p-4 flex flex-col gap-4 h-full"
      >
        <h2 class="text-2xl font-bold font-mono leading-tight">
          Device Details
        </h2>

        <!-- Config rows -->
        <div class="flex flex-col gap-3">
          <div v-if="device?.ipAddress" class="flex items-start gap-3">
            <UIcon
              :name="gatewayIcon"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-xs text-muted">Address</span>
              <span class="font-mono text-sm font-semibold"
                >{{ device.ipAddress }}:{{ device.port }}</span
              >
            </div>
          </div>

          <div v-if="device?.slaveId != null" class="flex items-start gap-3">
            <UIcon
              :name="binaryIcon"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-xs text-muted">Slave ID</span>
              <span class="font-mono text-sm font-semibold">{{
                device.slaveId
              }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon
              :name="sensorIcon"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-xs text-muted">Sensors</span>
              <span class="font-mono text-sm font-semibold">{{
                sensors.length
              }}</span>
            </div>
          </div>

          <div v-if="device?.createdAt" class="flex items-start gap-3">
            <UIcon
              :name="calendarIcon"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-xs text-muted">Added</span>
              <span class="font-mono text-sm font-semibold">{{
                formatDate(device.createdAt)
              }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon :name="hashIcon" class="size-4 text-muted shrink-0 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-xs text-muted">Device ID</span>
              <span class="font-mono text-sm font-semibold">{{
                device?.id ?? "—"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Sensor type breakdown -->
        <div class="grid grid-cols-3 gap-2 pt-1">
          <div
            v-for="group in SENSOR_GROUPS"
            :key="group.type"
            class="flex flex-col items-center gap-0.5 rounded-md border border-default py-2"
          >
            <span class="text-lg font-mono font-bold">{{
              typeCountLabel(group.type)
            }}</span>
            <UBadge
              :color="SENSOR_TYPE_COLOR[group.type]"
              variant="subtle"
              size="xs"
            >
              {{ group.label }}
            </UBadge>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 border-t border-default shrink-0 flex flex-col gap-2">
          <UButton
            :leading-icon="editIcon"
            label="Edit device"
            variant="outline"
            color="neutral"
            block
            @click="editOpen = true"
          />
          <UButton
            :leading-icon="deleteIcon"
            label="Delete device"
            variant="outline"
            color="error"
            block
            @click="deleteOpen = true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
