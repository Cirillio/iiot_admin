<!-- components/AppTooltip.vue -->
<template>
  <UTooltip
    v-bind="$attrs"
    :ui="{
      text: `font-mono text-secondary ${sizeClass}`,
      content: 'bg-elevated',
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
