<script setup lang="ts">
import { icons } from "~/core/icons-map";

const colorMode = useColorMode();

const toggleMode = () => {
  const modes = ["system", "light", "dark"] as const;
  const current = colorMode.preference as (typeof modes)[number];
  const nextIndex = (modes.indexOf(current) + 1) % modes.length;
  const nextMode = modes[nextIndex];
  if (nextMode) {
    colorMode.preference = nextMode;
  }
};

const currentIcon = computed((): string => {
  const pref = colorMode.preference;
  if (pref === "light") return icons.light;
  if (pref === "dark") return icons.dark;
  return icons.system;
});

const ariaLabel = computed(
  () => `Current theme: ${colorMode.preference}. Click to switch.`,
);
</script>

<template>
  <UButton
    :icon="currentIcon"
    color="neutral"
    variant="ghost"
    :aria-label="ariaLabel"
    @click="toggleMode"
  />
</template>
