<script lang="ts" setup>
import { appLogoIcon, narrowerIcon, widerIcon } from "~/core/icons-map";

const { isFluid, toggleWidth } = useLayout();
</script>

<template>
  <CustomCard class="justify-between py-2 px-4">
    <!-- Left: Logo -->
    <div class="flex items-center gap-2">
      <Icon :name="appLogoIcon" class="text-primary size-5" />
      <span class="font-mono font-semibold text-sm">IIoT System</span>
    </div>

    <!-- Right: Controls -->
    <div class="flex items-center gap-1">
      <AppNotificationsPopover />

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
  </CustomCard>
</template>
