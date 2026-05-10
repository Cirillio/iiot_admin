<script setup lang="ts">
import { lightIcon, darkIcon, systemIcon } from "~/core/icons-map";

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
  if (pref === "light") return lightIcon;
  if (pref === "dark") return darkIcon;
  return systemIcon;
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
