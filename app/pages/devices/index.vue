<script lang="ts" setup>
import { closeIcon, plusIcon, reloadIcon, searchIcon } from "~/core/icons-map";
import type {
  CreateDeviceDto,
  DashboardDevice,
  UpdateDeviceDto,
} from "~/types/models";

definePageMeta({
  title: "Devices",
  description: "Management and monitoring of all connected IIoT devices",
});

const { isFluid } = useLayout();
const api = useApi();
const notifications = useNotificationsStore();

const { data, pending, refresh } = await useAsyncData(
  "devices",
  () => api.devices.list(),
  { immediate: true },
);

const { data: connectionsData } = await useAsyncData(
  "connections",
  () => api.connections.list(),
  { immediate: true },
);

const connections = computed(() => connectionsData.value ?? []);

// --- Filters ---

const search = ref("");
const filterActive = ref<boolean | null>(null);

const devices = computed(() => data.value ?? []);

const filtered = computed(() => {
  let result = devices.value;
  if (filterActive.value !== null)
    result = result.filter((d) => d.isActive === filterActive.value);
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    result = result.filter(
      (d) => d.name?.toLowerCase().includes(q) || d.ipAddress?.includes(q),
    );
  }
  return result;
});

const stats = computed(() => ({
  total: devices.value.length,
  active: devices.value.filter((d) => d.isActive).length,
  inactive: devices.value.filter((d) => !d.isActive).length,
}));

// --- Pagination ---

const PAGE_SIZE = 20;
const page = ref(1);
watch([search, filterActive], () => {
  page.value = 1;
});

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);

const showPagination = computed(() => filtered.value.length > PAGE_SIZE);

// --- Create ---

const createOpen = ref(false);

const handleCreate = async (dto: CreateDeviceDto) => {
  try {
    await api.devices.create(dto);
    await refresh();
    notifications.add("Device created", `"${dto.name}" added`, "SUCCESS");
  } catch {
    notifications.add("Create failed", "Could not create device", "CRITICAL");
  }
};

// --- Edit ---

const editOpen = ref(false);
const editTarget = ref<DashboardDevice | null>(null);

const openEdit = (item: DashboardDevice) => {
  editTarget.value = item;
  editOpen.value = true;
};

const handleEdit = async (dto: UpdateDeviceDto) => {
  const id = editTarget.value?.id;
  if (!id) return;
  try {
    await api.devices.update(id, dto);
    await refresh();
    notifications.add("Device updated", editTarget.value?.name ?? "", "SUCCESS");
  } catch {
    notifications.add("Update failed", "Could not update device", "CRITICAL");
  }
};

// --- Delete ---

const deleteOpen = ref(false);
const deleteTarget = ref<DashboardDevice | null>(null);

const openDelete = (item: DashboardDevice) => {
  deleteTarget.value = item;
  deleteOpen.value = true;
};

const handleDelete = async () => {
  const id = deleteTarget.value?.id;
  if (!id) return;
  try {
    const name = deleteTarget.value?.name;
    await api.devices.delete(id);
    await refresh();
    notifications.add("Device deleted", `"${name}" removed`, "WARNING");
  } catch {
    notifications.add("Delete failed", "Could not delete device", "CRITICAL");
  }
};
</script>

<template>
  <div class="flex size-full flex-col overflow-hidden">
    <!-- Modals -->
    <DevicesCreateModal
      v-model:open="createOpen"
      :connections="connections"
      @submit="handleCreate"
    />
    <DevicesEditModal
      v-model:open="editOpen"
      :device="editTarget"
      :connections="connections"
      @submit="handleEdit"
    />
    <DevicesDeleteModal
      v-model:open="deleteOpen"
      :device-name="deleteTarget?.name"
      @confirm="handleDelete"
    />

    <!-- Toolbar -->
    <div
      class="flex items-center gap-3 border-b border-default px-4 py-3 shrink-0 flex-wrap"
    >
      <!-- Stats -->
      <div class="flex items-center gap-2 text-sm">
        <span class="font-mono font-bold text-default">{{ stats.total }}</span>
        <span class="text-muted">devices</span>
        <USeparator orientation="vertical" class="h-4 mx-1" />
        <span
          class="font-mono font-semibold"
          :class="stats.active > 0 ? 'text-success-400' : 'text-muted'"
          >{{ stats.active }}</span
        >
        <span class="text-muted">active</span>
        <span class="font-mono font-semibold text-muted">{{
          stats.inactive
        }}</span>
        <span class="text-muted">inactive</span>
      </div>

      <!-- Divider -->
      <USeparator orientation="vertical" class="h-5 mx-1" />

      <!-- Filter tabs -->
      <div class="flex gap-1">
        <UButton
          label="All"
          size="sm"
          :variant="filterActive === null ? 'solid' : 'ghost'"
          color="neutral"
          @click="filterActive = null"
        />
        <UButton
          label="Active"
          size="sm"
          :variant="filterActive === true ? 'solid' : 'ghost'"
          :color="filterActive === true ? 'success' : 'neutral'"
          @click="filterActive = true"
        />
        <UButton
          label="Inactive"
          size="sm"
          :variant="filterActive === false ? 'solid' : 'ghost'"
          color="neutral"
          @click="filterActive = false"
        />
      </div>

      <!-- Search -->
      <UInput
        v-model="search"
        :leading-icon="searchIcon"
        placeholder="Name or IP…"
        class="max-w-60 w-full"
        :ui="{ trailing: 'pr-1' }"
      >
        <template v-if="search" #trailing>
          <UButton
            :icon="closeIcon"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="search = ''"
          />
        </template>
      </UInput>

      <!-- Count badge when filtered -->
      <UBadge
        v-if="search || filterActive !== null"
        :label="`${filtered.length} / ${stats.total}`"
        color="neutral"
        variant="outline"
        size="sm"
      />

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <UButton
          :leading-icon="plusIcon"
          label="New device"
          size="sm"
          @click="createOpen = true"
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
    </div>

    <!-- Grid -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div
        v-if="paginated.length > 0"
        class="grid gap-3 p-4 content-start"
        :class="[!isFluid ? 'grid-cols-2' : 'grid-cols-3']"
      >
        <DevicesListCard
          v-for="device in paginated"
          :key="device.id"
          :item="device"
          @edit="openEdit"
          @delete="openDelete"
        />
      </div>
      <div
        v-else
        class="flex-1 h-full flex items-center justify-center text-muted text-sm"
      >
        No devices match the current filter
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="showPagination"
      class="flex justify-center py-3 border-t border-default shrink-0"
    >
      <UPagination
        v-model:page="page"
        :total="filtered.length"
        :items-per-page="PAGE_SIZE"
        size="sm"
      />
    </div>
  </div>
</template>
