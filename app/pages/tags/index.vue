<script lang="ts" setup>
import { closeIcon, plusIcon, reloadIcon, searchIcon } from "~/core/icons-map";
import type { CreateTagDto, TagDataType } from "~/types/models";
import { TAG_DATA_TYPE, TAG_TYPE_COLOR } from "~/types/models";

definePageMeta({
  title: "Tags",
  description: "All registered tags across devices",
});

const api = useApi();
const { values: metricsValues } = storeToRefs(useRealTimeStore());

const { data, pending, refresh } = useAsyncData("tags", () => api.tags.list(), {
  immediate: true,
});

const { data: devices } = useAsyncData("devices-for-filter", () =>
  api.devices.list(),
);

const search = ref("");
const activeTypes = ref<Set<TagDataType>>(new Set());
const selectedDeviceId = ref<number | null>(null);

const ALL_TYPES = Object.values(TAG_DATA_TYPE) as TagDataType[];

const typeLabel = (t: TagDataType) => t.replace(/_/g, " ");

const filteredTags = computed(() => {
  let result = data.value ?? [];

  if (selectedDeviceId.value !== null)
    result = result.filter((s) => s.deviceId === selectedDeviceId.value);

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

const toggleType = (t: TagDataType) => {
  const next = new Set(activeTypes.value);
  if (next.has(t)) next.delete(t);
  else next.add(t);
  activeTypes.value = next;
};

const PAGE_SIZE = 25;
const page = ref(1);

watch([search, activeTypes, selectedDeviceId], () => {
  page.value = 1;
});

const paginatedTags = computed(() =>
  filteredTags.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);

const showPagination = computed(() => filteredTags.value.length > PAGE_SIZE);

const toast = useToast();

const handleDelete = async (id: number | undefined) => {
  if (id === undefined) return;
  await api.tags.delete(id);
  toast.add({
    title: `Tag "${data.value?.find((v) => v.tagId === id)?.name}" deleted`,
    color: "error",
  });
  await refresh();
};

// --- Create ---

const createOpen = ref(false);

const handleCreate = async (dto: CreateTagDto) => {
  try {
    await api.tags.create(dto);
    await refresh();
    toast.add({ title: `Tag "${dto.name}" created`, color: "success" });
  } catch {
    toast.add({ title: "Failed to create tag", color: "error" });
  }
};
</script>

<template>
  <div class="flex size-full flex-col overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-2 flex-wrap border-b border-default p-4 shrink-0"
    >
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
            size="xs"
            variant="ghost"
            color="neutral"
            @click="search = ''"
          />
        </template>
      </UInput>

      <div class="flex gap-1">
        <UButton
          v-for="t in ALL_TYPES"
          :key="t"
          :label="typeLabel(t)"
          :color="activeTypes.has(t) ? TAG_TYPE_COLOR[t] : 'neutral'"
          :variant="activeTypes.has(t) ? 'soft' : 'outline'"
          size="sm"
          @click="toggleType(t)"
        />
      </div>

      <USelect
        v-model="selectedDeviceId"
        :items="[
          { label: 'All devices', value: null },
          ...(devices ?? []).map((d) => ({
            label: d.name ?? `Device ${d.id}`,
            value: d.id,
          })),
        ]"
        size="sm"
        class="w-40"
        value-key="value"
        label-key="label"
        placeholder="All devices"
      />

      <div class="ml-auto flex items-center gap-3">
        <UButton
          :leading-icon="plusIcon"
          label="New tag"
          size="sm"
          @click="createOpen = true"
        />
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="md"
          :disabled="pending"
          @click="refresh()"
        />
        <UBadge
          color="neutral"
          variant="outline"
          size="lg"
          :label="`${filteredTags.length} / ${data?.length ?? 0}`"
        />
      </div>
    </div>

    <TagsCreateModal
      v-model:open="createOpen"
      :devices="devices ?? []"
      @submit="handleCreate"
    />

    <!-- Table -->
    <TagsListTable
      :devices="devices"
      :data="paginatedTags"
      :tag-metrics="metricsValues"
      @delete:tag="handleDelete"
      @refresh="refresh"
    />

    <div
      v-if="showPagination"
      class="flex justify-center py-3 border-t border-default shrink-0"
    >
      <UPagination
        v-model:page="page"
        :total="filteredTags.length"
        :items-per-page="PAGE_SIZE"
        size="sm"
      />
    </div>
  </div>
</template>
