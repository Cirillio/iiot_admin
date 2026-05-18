<template>
  <div class="h-full min-h-0 flex flex-col">
    <div class="grid grid-cols-[auto_1fr] h-full flex-1 min-h-0">
      <app-aside class="border-r border-default" />
      <u-main class="size-full min-h-0">
        <slot />
      </u-main>
    </div>
  </div>
</template>
