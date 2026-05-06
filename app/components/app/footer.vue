<script lang="ts" setup>
import { icons } from "~/core/icons-map";

const version = "v1.4.2-build.89";
const env = "Development";
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer
    class="border-t border-default flex items-center justify-between px-6 py-2 bg-default/5"
  >
    <div class="flex items-center gap-4 text-xs text-default/75 font-sans">
      <div class="flex uppercase items-center gap-1.5">
        <span
          class="size-1.5 animate-pulse rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"
        />
        <span>System Status:</span>
        <span class="text-success font-medium">Healthy</span>
      </div>

      <div class="h-3 w-px bg-default/20" />

      <div class="flex uppercase items-center gap-1">
        <span>Env:</span>
        <span
          class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold tracking-wider"
        >
          {{ env }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-4 text-xs text-default/60">
      <div class="flex items-center gap-1">
        <UIcon :name="icons.branch" class="size-4" />
        <span>{{ version }}</span>
      </div>

      <div class="h-3 w-px bg-default/20" />

      <div class="flex items-center gap-1 font-medium">
        <span>&copy; {{ currentYear }} IIoT Admin</span>
      </div>
    </div>
  </footer>
</template>
