<script lang="ts" setup>
import { MOCK_USER } from "~/mock";

const { isFluid } = useLayout();
</script>

<template>
  <u-container
    :class="[
      'mx-auto w-full overflow-y-hidden h-dvh',
      isFluid ? 'max-w-none' : 'max-w-5xl',
    ]"
  >
    <div class="border-x bg-default/85 h-full flex flex-col border-accented">
      <app-toolbar />
      <app-header :user="MOCK_USER" />
      <div class="grid grid-cols-[auto_1fr] flex-1 min-h-0">
        <app-aside class="border-r border-default" />
        <u-main class="size-full min-h-0">
          <slot />
        </u-main>
      </div>
      <app-footer />
    </div>
  </u-container>
</template>
