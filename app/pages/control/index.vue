<script lang="ts" setup>
import { reloadIcon, controlIcon, signalIcon } from "~/core/icons-map";
import { isWritableTag, type WritableTag } from "~/utils/tag";

definePageMeta({
  title: "Control",
  description: "АРМ оператора: запись в исполнительные механизмы (Coils / Holding Registers)",
});

const { isFluid } = useLayout();
const api = useApi();
const { connect, isConnected } = useControlHub();

const { data: tagsData, pending, refresh } = await useAsyncData(
  "tags",
  () => api.tags.list(),
  { immediate: true },
);

const { data: devicesData } = await useAsyncData(
  "devices",
  () => api.devices.list(),
  { immediate: true },
);

// Гарантируем канал диспетчеризации при заходе на АРМ (на случай выключенного autoconnect).
onMounted(() => {
  if (!isConnected.value) connect();
});

const deviceNameById = computed(() => {
  const map = new Map<number, string>();
  for (const d of devicesData.value ?? []) {
    if (d.id != null) map.set(d.id, d.name ?? `Device #${d.id}`);
  }
  return map;
});

const writableTags = computed<WritableTag[]>(() =>
  (tagsData.value ?? []).filter(isWritableTag),
);

// Группировка writable-тегов по устройству для раскладки АРМ.
const groups = computed(() => {
  const byDevice = new Map<number, WritableTag[]>();
  for (const tag of writableTags.value) {
    const key = tag.deviceId ?? -1;
    const list = byDevice.get(key) ?? [];
    list.push(tag);
    byDevice.set(key, list);
  }
  return [...byDevice.entries()].map(([deviceId, tags]) => ({
    deviceId,
    deviceName: deviceNameById.value.get(deviceId) ?? "Без устройства",
    tags,
  }));
});

const total = computed(() => writableTags.value.length);
</script>

<template>
  <div class="flex size-full flex-col overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-3 border-b border-default px-4 py-3 shrink-0 flex-wrap"
    >
      <div class="flex items-center gap-2 text-sm">
        <UIcon :name="controlIcon" class="size-5 text-muted" />
        <span class="font-mono font-bold text-default">{{ total }}</span>
        <span class="text-muted">управляемых тегов</span>
      </div>

      <USeparator orientation="vertical" class="h-5 mx-1" />

      <!-- Control channel status -->
      <div class="flex items-center gap-2">
        <UIcon
          :name="signalIcon"
          class="size-4"
          :class="isConnected ? 'text-success-400' : 'text-muted/50'"
        />
        <span class="text-sm" :class="isConnected ? 'text-success-400' : 'text-muted'">
          {{ isConnected ? "Канал управления активен" : "Канал отключён" }}
        </span>
        <UButton
          v-if="!isConnected"
          label="Подключить"
          size="xs"
          variant="subtle"
          @click="connect()"
        />
      </div>

      <div class="flex items-center gap-2 ml-auto">
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

    <!-- Groups -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div v-if="groups.length > 0" class="flex flex-col gap-6 p-4">
        <section v-for="group in groups" :key="group.deviceId" class="flex flex-col gap-3">
          <h2 class="text-sm font-semibold text-muted uppercase tracking-wider">
            {{ group.deviceName }}
          </h2>
          <div
            class="grid gap-3 content-start"
            :class="[!isFluid ? 'grid-cols-2' : 'grid-cols-3']"
          >
            <ControlWriteControl
              v-for="tag in group.tags"
              :key="tag.tagId"
              :tag="tag"
            />
          </div>
        </section>
      </div>
      <div
        v-else
        class="flex-1 h-full flex items-center justify-center text-muted text-sm"
      >
        Нет управляемых тегов (Coil / Holding Register)
      </div>
    </div>
  </div>
</template>
