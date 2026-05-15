<script lang="ts" setup>
definePageMeta({
  title: "Devices",
  description: "Management and monitoring of all connected IIoT devices",
});

const { isFluid } = useLayout();
const api = useApi();

const { data, pending, refresh } = await useAsyncData(
  "devices",
  () => api.devices.list(),
  { immediate: true },
);

const PAGE_SIZE = 20;
const page = ref(1);

const devices = computed(() => data.value ?? []);

const paginated = computed(() =>
  devices.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);

const showPagination = computed(() => devices.value.length > PAGE_SIZE);
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex items-center gap-4 border-b p-4 border-default shrink-0">
      <UBadge
        color="info"
        :label="`Devices: ${devices.length}`"
        variant="outline"
        size="lg"
      />
      <UButton
        variant="subtle"
        label="Refresh"
        color="neutral"
        :loading="pending"
        @click="refresh()"
      />
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div
        class="grid gap-2 p-4 content-start"
        :class="[!isFluid ? 'grid-cols-3' : 'grid-cols-5']"
      >
        <DevicesListCard
          v-for="device in paginated"
          :key="device.id"
          :item="device"
        />
      </div>
    </div>

    <div v-if="showPagination" class="flex justify-center py-3 border-t border-default shrink-0">
      <UPagination
        v-model:page="page"
        :total="devices.length"
        :items-per-page="PAGE_SIZE"
        size="sm"
      />
    </div>
  </div>
</template>
