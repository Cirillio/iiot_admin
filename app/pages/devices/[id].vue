<script lang="ts" setup>
import {
  arrowLeftIcon,
  binaryIcon,
  calendarIcon,
  deleteIcon,
  editIcon,
  expandIcon,
  gatewayIcon,
  hashIcon,
  plusIcon,
  reloadIcon,
  tagIcon,
  viewCardsIcon,
  viewTableIcon,
} from "~/core/icons-map";
import type { Metric } from "~/types/api";
import type {
  CreateTagDto,
  Device,
  TagDataType,
  TagSettings,
  UpdateDeviceDto,
} from "~/types/models";

definePageMeta({
  title: "Device",
  description: "Device monitoring and tag management",
});

const { isFluid } = useLayout();

const api = useApi();
const router = useRouter();
const route = useRoute();
const notifications = useNotificationsStore();
const rt = useRealTimeStore();

const deviceId = Number(route.params.id);

const { data, pending, refresh } = useAsyncData(
  `device-${deviceId}`,
  () => api.devices.getById(deviceId),
  { immediate: true },
);

const device = computed<Device>(() => {
  const { tags, ...rest } = data.value || {};
  return rest as Device;
});

const tags = computed<TagSettings[]>(() => data.value?.tags ?? []);

// Connection endpoint is decoupled from the device — resolve via connectionId.
const { data: connectionsData } = useAsyncData("connections", () =>
  api.connections.list(),
);

const connections = computed(() => connectionsData.value ?? []);

const connection = computed(
  () =>
    connectionsData.value?.find((c) => c.id === device.value?.connectionId) ??
    null,
);

const TAG_GROUPS = [
  {
    label: "Analog",
    color: "info" as const,
    types: ["ANALOG_RAW", "ANALOG_PHYSICAL"] as TagDataType[],
  },
  {
    label: "Digital",
    color: "success" as const,
    types: ["DIGITAL"] as TagDataType[],
  },
] as const;

const tagsByGroup = computed(
  () =>
    Object.fromEntries(
      TAG_GROUPS.map(({ label, types }) => [
        label,
        tags.value.filter((t) => t.dataType && types.includes(t.dataType)),
      ]),
    ) as Record<string, TagSettings[]>,
);

const groupTags = (label: string): TagSettings[] =>
  tagsByGroup.value[label] ?? [];

// --- Device edit/delete ---

const editOpen = ref(false);
const deleteOpen = ref(false);

const handleDeviceUpdate = async (dto: UpdateDeviceDto) => {
  try {
    await api.devices.update(deviceId, dto);
    await refresh();
    notifications.add("Device updated", device.value?.name ?? "", "SUCCESS");
  } catch (e) {
    notifications.add("Update failed", `Device: ${e}`, "CRITICAL");
  }
};

const handleDeviceDelete = async () => {
  try {
    await api.devices.delete(deviceId);
    notifications.add("Device deleted", device.value?.name ?? "", "WARNING");
    router.push("/devices");
  } catch {
    notifications.add("Delete failed", "Could not delete device", "CRITICAL");
  }
};

// --- Tag view ---

type ViewMode = "cards" | "table";
const viewMode = ref<ViewMode>("cards");
const tagsModalOpen = ref(false);

const tagMetrics = computed<Map<number, Metric>>(() => {
  const map = new Map<number, Metric>();
  for (const t of tags.value) {
    if (t.tagId == null) continue;
    const m = rt.getMetricByTagId(t.tagId);
    if (m) map.set(t.tagId, m);
  }
  return map;
});

// --- Tag create ---

const tagCreateOpen = ref(false);

const handleTagCreate = async (dto: CreateTagDto) => {
  try {
    await api.tags.create(dto);
    await refresh();
    notifications.add("Tag created", `"${dto.name}" added`, "SUCCESS");
  } catch {
    notifications.add("Create failed", "Could not create tag", "CRITICAL");
  }
};

// --- Tag edit ---

const tagEditOpen = ref(false);
const selectedTag = ref<TagSettings | null>(null);

const openTagEdit = (tag: TagSettings) => {
  selectedTag.value = tag;
  tagEditOpen.value = true;
};

// --- Tag appearance / thresholds ---

const tagAppearanceOpen = ref(false);

const openTagAppearance = (tag: TagSettings) => {
  selectedTag.value = tag;
  tagAppearanceOpen.value = true;
};

const handleTagUpdate = async (dto: Partial<TagSettings>) => {
  const current = selectedTag.value;
  const id = current?.tagId;
  if (!id || !current) return;
  try {
    // Полная замена: весь тег + правки формы; uiConfig сохраняется маппером.
    await api.tags.update(
      id,
      toUpdateTagDto(current, {
        portNumber: dto.portNumber,
        name: dto.name ?? undefined,
        slug: dto.slug ?? undefined,
        dataType: formatBackendEnum(dto.dataType),
        registerAddress: dto.registerAddress,
        registerType: formatBackendEnum(dto.registerType),
        registerCount: dto.registerCount,
        unit: dto.unit ?? undefined,
        inputMin: dto.inputMin,
        inputMax: dto.inputMax,
        outputMin: dto.outputMin,
        outputMax: dto.outputMax,
        offsetVal: dto.offsetVal,
        endianness: formatBackendEnum(dto.endianness),
        deadbandThreshold: dto.deadbandThreshold,
      }),
    );
    await refresh();
    notifications.add("Tag updated", `"${current.name}" saved`, "SUCCESS");
  } catch {
    notifications.add("Update failed", `Could not update "${current.name}"`, "CRITICAL");
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
  <div class="flex flex-col size-full overflow-hidden">
    <!-- ─── Modals ─────────────────────────────────────────────────── -->
    <DevicesEditModal
      v-model:open="editOpen"
      :device="device"
      :connections="connections"
      @submit="handleDeviceUpdate"
    />
    <DevicesDeleteModal
      v-model:open="deleteOpen"
      :device-name="device?.name"
      @confirm="handleDeviceDelete"
    />
    <TagsEditModal
      v-model:open="tagEditOpen"
      :tag="selectedTag"
      @submit="handleTagUpdate"
    />
    <TagsUiConfigModal
      v-model:open="tagAppearanceOpen"
      :tag="selectedTag"
      @saved="refresh()"
    />
    <DevicesTagsModal
      v-model:open="tagsModalOpen"
      :tags="tags"
      :device-name="device?.name"
      @edit="openTagEdit"
      @appearance="openTagAppearance"
    />
    <TagsCreateModal
      v-model:open="tagCreateOpen"
      :devices="device ? [device] : []"
      :fixed-device-id="deviceId"
      @submit="handleTagCreate"
    />

    <!-- Nav -->
    <div
      class="flex items-center justify-between px-3 py-2.5 border-b border-default shrink-0"
    >
      <UButton
        :icon="arrowLeftIcon"
        variant="ghost"
        color="neutral"
        size="sm"
        to="/devices"
      />

      <!-- Device name -->
      <h1 class="text-2xl font-bold font-mono leading-tight wrap-break-word">
        {{ device?.name ?? "—" }}
      </h1>

      <div class="flex items-center gap-1">
        <UButton
          :icon="reloadIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          :disabled="pending"
          @click="refresh()"
        />
        <UBadge
          :color="rt.isConnected ? 'success' : 'neutral'"
          variant="subtle"
          size="sm"
          class="font-mono uppercase tracking-widest"
          :class="rt.isConnected ? 'animate-pulse' : ''"
        >
          {{ rt.isConnected ? "live" : "offline" }}
        </UBadge>
      </div>
    </div>

    <div class="flex h-full min-h-0">
      <!-- ─── Left panel: Tags ─────────────────────────────────────── -->
      <div class="flex-3 min-w-0 h-full min-h-0 flex flex-col">
        <!-- Tags header -->
        <div
          class="flex items-center gap-2 px-4 py-2.5 border-b border-default min-h-0"
        >
          <UIcon :name="tagIcon" class="size-6 text-muted" />
          <span class="text-base font-semibold">Connected Tags</span>
          <UBadge color="neutral" variant="outline" size="sm" class="font-mono">
            {{ tags.length }}
          </UBadge>
          <div class="flex items-center gap-1 ml-auto">
            <UButton
              :leading-icon="plusIcon"
              label="New tag"
              size="xs"
              variant="soft"
              @click="tagCreateOpen = true"
            />
            <USeparator orientation="vertical" class="h-4 mx-1" />
            <UButton
              :icon="viewCardsIcon"
              size="xs"
              variant="ghost"
              :color="viewMode === 'cards' ? 'primary' : 'neutral'"
              @click="viewMode = 'cards'"
            />
            <UButton
              :icon="viewTableIcon"
              size="xs"
              variant="ghost"
              :color="viewMode === 'table' ? 'primary' : 'neutral'"
              @click="viewMode = 'table'"
            />
            <USeparator orientation="vertical" class="h-4 mx-1" />
            <UButton
              :icon="expandIcon"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="tagsModalOpen = true"
            />
          </div>
        </div>

        <!-- Cards: column headers -->
        <template v-if="viewMode === 'cards'">
          <div class="grid min-h-0 grid-cols-2 w-full gap-4 pt-4 px-4">
            <template v-for="gr in TAG_GROUPS" :key="gr.label">
              <div
                class="flex items-center gap-2 pb-2 px-2 border-b border-default"
              >
                <span
                  class="text-base font-bold uppercase tracking-widest text-default/85"
                >
                  {{ gr.label }}
                </span>
                <UBadge :color="gr.color" variant="subtle" size="sm">
                  {{ groupTags(gr.label).length }}
                </UBadge>
              </div>
            </template>
          </div>

          <ScrollableWrapper>
            <div class="grid grid-cols-2 gap-4 p-4 items-start">
              <div
                v-for="group in TAG_GROUPS"
                :key="group.label"
                class="flex flex-col gap-2.5"
              >
                <template v-if="groupTags(group.label).length > 0">
                  <DevicesTagCard
                    v-for="tag in groupTags(group.label)"
                    :key="tag.tagId"
                    :item="tag"
                    @edit="openTagEdit"
                    @appearance="openTagAppearance"
                  />
                </template>
                <div
                  v-else
                  class="rounded-lg border border-dashed border-default/30 py-8 flex items-center justify-center"
                >
                  <span class="text-xs text-muted/40">No tags</span>
                </div>
              </div>
            </div>
          </ScrollableWrapper>
        </template>

        <!-- Table view -->
        <template v-else>
          <ScrollableWrapper>
            <TagsListTable
              :data="tags"
              :tag-metrics="tagMetrics"
              :hidden-columns="['device', 'updatedAt']"
              @refresh="refresh()"
            />
          </ScrollableWrapper>
        </template>
      </div>

      <!-- Right panel: Device details-->
      <div
        class="flex-1 min-h-0 border-l border-default overflow-y-auto p-4 flex flex-col gap-4 h-full"
      >
        <h2 class="text-2xl font-bold font-mono leading-tight">
          Device Details
        </h2>

        <!-- Reachability (runtime, collector-driven) -->
        <div
          class="rounded-lg border p-3 flex flex-col gap-1"
          :class="
            device?.isActive
              ? device?.isOnline
                ? 'border-success-500/40 bg-success-500/5'
                : 'border-error-500/40 bg-error-500/5'
              : 'border-default bg-elevated/30'
          "
        >
          <div class="flex items-center gap-2">
            <span
              class="size-2.5 rounded-full shrink-0"
              :class="
                !device?.isActive
                  ? 'bg-neutral-600'
                  : device?.isOnline
                    ? 'bg-success-500 animate-pulse'
                    : 'bg-error-500'
              "
            />
            <span class="text-sm font-semibold uppercase tracking-widest">
              {{
                !device?.isActive
                  ? "Polling disabled"
                  : device?.isOnline
                    ? "Online"
                    : "Offline"
              }}
            </span>
          </div>
          <span class="text-xs text-muted font-mono">
            Last seen:
            {{ device?.lastSeen ? new Date(device.lastSeen).toLocaleString("ru-RU") : "—" }}
          </span>
          <span
            v-if="device?.lastConnError && !device?.isOnline"
            class="text-xs text-error-400 break-all"
          >
            {{ device.lastConnError }}
          </span>
        </div>

        <!-- Config rows -->
        <div class="flex flex-col gap-3">
          <div v-if="connection" class="flex items-start gap-3">
            <UIcon
              :name="gatewayIcon"
              class="size-6 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-base text-muted">Address</span>
              <span class="font-mono text-lg font-semibold"
                >{{ connection.ipAddress }}:{{ connection.port }}</span
              >
            </div>
          </div>

          <div v-if="device?.slaveId != null" class="flex items-start gap-3">
            <UIcon
              :name="binaryIcon"
              class="size-6 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-base text-muted">Slave ID</span>
              <span class="font-mono text-lg font-semibold">{{
                device.slaveId
              }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon :name="tagIcon" class="size-6 text-muted shrink-0 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-base text-muted">Tags</span>
              <span class="font-mono text-lg font-semibold">{{
                tags.length
              }}</span>
            </div>
          </div>

          <div v-if="device?.createdAt" class="flex items-start gap-3">
            <UIcon
              :name="calendarIcon"
              class="size-6 text-muted shrink-0 mt-0.5"
            />
            <div class="flex flex-col">
              <span class="text-base text-muted">Added</span>
              <span class="font-mono text-lg font-semibold">{{
                formatDate(device.createdAt)
              }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon :name="hashIcon" class="size-6 text-muted shrink-0 mt-0.5" />
            <div class="flex flex-col">
              <span class="text-base text-muted">Device ID</span>
              <span class="font-mono text-lg font-semibold">{{
                device?.id ?? "—"
              }}</span>
            </div>
          </div>
        </div>

        <!-- Tag type breakdown -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <div
            v-for="group in TAG_GROUPS"
            :key="group.label"
            class="flex flex-col items-center gap-2 rounded-md border border-default py-4"
          >
            <span class="text-xl font-mono font-bold">{{
              groupTags(group.label).length
            }}</span>
            <UBadge :color="group.color" variant="subtle">
              {{ group.label }}
            </UBadge>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="p-4 border-t border-default shrink-0 grid gap-4"
          :class="[isFluid ? 'grid-cols-2' : '']"
        >
          <UButton
            :leading-icon="editIcon"
            label="Edit"
            variant="outline"
            color="neutral"
            block
            @click="editOpen = true"
          />
          <UButton
            :leading-icon="deleteIcon"
            label="Delete"
            variant="ghost"
            color="error"
            block
            @click="deleteOpen = true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
