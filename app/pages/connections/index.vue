<script lang="ts" setup>
import { closeIcon, plusIcon, reloadIcon, searchIcon } from "~/core/icons-map";
import type {
  CreateConnectionDto,
  ModbusConnection,
  UpdateConnectionDto,
} from "~/types/models";

definePageMeta({
  title: "Connections",
  description: "Management of Modbus TCP connections",
});

const { isFluid } = useLayout();
const api = useApi();
const notifications = useNotificationsStore();

const { data, pending, refresh } = await useAsyncData(
  "connections",
  () => api.connections.list(),
  { immediate: true },
);

const search = ref("");

const connections = computed(() => data.value ?? []);

const filtered = computed(() => {
  if (!search.value.trim()) return connections.value;
  const q = search.value.trim().toLowerCase();
  return connections.value.filter(
    (c) =>
      c.ipAddress?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q),
  );
});

// --- Create ---

const createOpen = ref(false);

const handleCreate = async (dto: CreateConnectionDto) => {
  try {
    await api.connections.create(dto);
    await refresh();
    notifications.add("Connection created", `${dto.ipAddress} added`, "SUCCESS");
  } catch {
    notifications.add("Create failed", "Could not create connection", "CRITICAL");
  }
};

// --- Edit ---

const editOpen = ref(false);
const editTarget = ref<ModbusConnection | null>(null);

const openEdit = (item: ModbusConnection) => {
  editTarget.value = item;
  editOpen.value = true;
};

const handleEdit = async (dto: UpdateConnectionDto) => {
  const id = editTarget.value?.id;
  if (!id) return;
  try {
    await api.connections.update(id, dto);
    await refresh();
    notifications.add("Connection updated", editTarget.value?.ipAddress ?? "", "SUCCESS");
  } catch {
    notifications.add("Update failed", "Could not update connection", "CRITICAL");
  }
};

// --- Delete ---

const deleteOpen = ref(false);
const deleteTarget = ref<ModbusConnection | null>(null);

const openDelete = (item: ModbusConnection) => {
  deleteTarget.value = item;
  deleteOpen.value = true;
};

const handleDelete = async () => {
  const id = deleteTarget.value?.id;
  if (!id) return;
  try {
    const ip = deleteTarget.value?.ipAddress;
    await api.connections.delete(id);
    await refresh();
    notifications.add("Connection deleted", `${ip} removed`, "WARNING");
  } catch {
    notifications.add("Delete failed", "Could not delete connection", "CRITICAL");
  }
};
</script>

<template>
  <div class="flex size-full flex-col overflow-hidden">
    <!-- Modals -->
    <ConnectionsCreateModal v-model:open="createOpen" @submit="handleCreate" />
    <ConnectionsEditModal
      v-model:open="editOpen"
      :connection="editTarget"
      @submit="handleEdit"
    />
    <ConnectionsDeleteModal
      v-model:open="deleteOpen"
      :connection-label="deleteTarget?.ipAddress"
      @confirm="handleDelete"
    />

    <!-- Toolbar -->
    <div
      class="flex items-center gap-3 border-b border-default px-4 py-3 shrink-0 flex-wrap"
    >
      <div class="flex items-center gap-2 text-sm">
        <span class="font-mono font-bold text-default">{{
          connections.length
        }}</span>
        <span class="text-muted">connections</span>
      </div>

      <USeparator orientation="vertical" class="h-5 mx-1" />

      <UInput
        v-model="search"
        :leading-icon="searchIcon"
        placeholder="IP or description…"
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

      <div class="flex items-center gap-2 ml-auto">
        <UButton
          :leading-icon="plusIcon"
          label="New connection"
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
        v-if="filtered.length > 0"
        class="grid gap-3 p-4 content-start"
        :class="[!isFluid ? 'grid-cols-2' : 'grid-cols-3']"
      >
        <ConnectionsListCard
          v-for="connection in filtered"
          :key="connection.id"
          :item="connection"
          @edit="openEdit"
          @delete="openDelete"
        />
      </div>
      <div
        v-else
        class="flex-1 h-full flex items-center justify-center text-muted text-sm"
      >
        No connections yet
      </div>
    </div>
  </div>
</template>
