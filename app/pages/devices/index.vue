<script lang="ts" setup>
definePageMeta({
  title: "Devices",
  description: "Management and monitoring of all connected IIoT devices",
});

const { isFluid } = useLayout();

const api = useApi();

const { data, error, pending, refresh } = await useAsyncData(
  "devices",
  () => api.devices.list(),
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="flex gap-4 border-b p-4 border-default shrink-0">
      <UBadge
        color="info"
        :label="'Device count: ' + data?.length"
        variant="outline"
        size="lg"
      />
      <UButton
        variant="subtle"
        label="refresh"
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
          v-for="device in data"
          :key="device.id"
          :item="device"
        />
      </div>
    </div>
  </div>
</template>
