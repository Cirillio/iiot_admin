<script lang="ts" setup>
import { appLogoIcon, narrowerIcon, widerIcon } from "~/core/icons-map";
import { MOCK_USER } from "~/mock";

const { isFluid, toggleWidth } = useLayout();
</script>

<template>
  <div
    class="border-b border-default flex w-full py-1.5 px-4 items-center justify-between shrink-0"
  >
    <!-- Left: Logo -->
    <div class="flex items-center gap-2">
      <Icon :name="appLogoIcon" class="text-primary size-5" />
      <span class="font-mono font-semibold text-sm">IIoT System</span>
    </div>

    <!-- Right: Controls + Profile -->
    <div class="flex items-center gap-1">
      <AppNotificationsPopover />

      <USeparator orientation="vertical" class="h-5 mx-1" />

      <NuxtLink
        to="/profile"
        class="flex items-center gap-2 rounded-md px-2 py-1 ring ring-transparent hover:ring-primary transition"
      >
        <div class="flex flex-col items-end">
          <span class="text-xs font-semibold leading-tight">{{
            MOCK_USER.name
          }}</span>
          <span
            class="text-[10px] text-muted uppercase tracking-wider leading-tight"
            >{{ MOCK_USER.role }}</span
          >
        </div>
        <UAvatar :src="MOCK_USER.avatar" size="xs" />
      </NuxtLink>

      <USeparator orientation="vertical" class="h-5 mx-1" />

      <CustomTooltip
        :text="isFluid ? 'Narrower' : 'Wider'"
        :content="{ align: 'end' }"
        :delay-duration="150"
      >
        <UButton
          :icon="isFluid ? narrowerIcon : widerIcon"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="toggleWidth"
        />
      </CustomTooltip>
    </div>
  </div>
</template>
