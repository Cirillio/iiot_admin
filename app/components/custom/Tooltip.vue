<!-- components/AppTooltip.vue -->
<template>
  <UTooltip
    v-bind="$attrs"
    :ui="{
      text: `font-sans text-white ${sizeClass}`,
      content:
        'bg-white/40 rounded-full px-4 py-4 backdrop-blur-sm ring-white/80 shadow-lg',
    }"
  >
    <slot />
    <template #content>
      <slot name="content" />
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
import type { TooltipProps } from "@nuxt/ui";

defineOptions({ inheritAttrs: false });

interface Props extends /* @vue-ignore */ TooltipProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const props = defineProps<Props>();

const sizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const sizeClass = computed(() => sizeMap[props.size ?? "sm"]);
</script>
