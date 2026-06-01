<script lang="ts" setup>
withDefaults(
  defineProps<{
    label: string;
    connected: boolean;
    size?: "xs" | "sm" | "lg";
  }>(),
  { size: "xs" },
);

const emit = defineEmits<{ (e: "toggle"): void }>();
</script>

<template>
  <div class="flex gap-2 items-center">
    <span
      class="size-1.5 rounded-full shrink-0"
      :class="
        connected
          ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]'
          : 'bg-error-500'
      "
    />
    <span>{{ label }}:</span>
    <span
      class="font-medium"
      :class="connected ? 'text-success' : 'text-error-500'"
    >
      {{ connected ? "Connected" : "Disconnected" }}
    </span>
    <UButton
      :label="connected ? 'disconnect' : 'connect'"
      :size="size"
      variant="outline"
      color="neutral"
      class="ml-auto"
      @click="emit('toggle')"
    />
  </div>
</template>
