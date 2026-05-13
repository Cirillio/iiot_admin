<script lang="ts" setup>
import { MOCK_USER } from "~/mock";
</script>

<template>
  <div class="h-full min-h-0 flex flex-col">
    <app-header :user="MOCK_USER" />
    <div class="grid grid-cols-[auto_1fr] h-full flex-1 min-h-0">
      <app-aside class="border-r border-default" />
      <u-main class="size-full min-h-0">
        <slot />
      </u-main>
    </div>
  </div>
</template>
