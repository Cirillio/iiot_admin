<template>
  <div
    class="border-b border-default flex w-full py-2 px-6 items-center justify-between"
  >
    <div class="flex items-center gap-2">
      <Icon :name="appLogoIcon" class="text-primary size-6" />
      <span class="font-mono font-medium text-lg">IIoT System</span>
    </div>
    <div class="flex gap-2">
      <CustomTooltip
        text="Search"
        :content="{ align: 'end' }"
        :delay-duration="150"
      >
        <UButton :icon="searchIcon" variant="soft" color="neutral" />
      </CustomTooltip>

      <CustomTooltip
        text="Notifications"
        :content="{
          align: 'end',
        }"
        :delay-duration="150"
      >
        <UButton :icon="notificationIcon" variant="soft" color="neutral" />
      </CustomTooltip>

      <CustomTooltip
        :text="isFluid ? 'Narrower' : 'Wider'"
        :content="{ align: 'end' }"
        :delay-duration="150"
      >
        <UButton
          :icon="isFluid ? narrowerIcon : widerIcon"
          variant="soft"
          color="neutral"
          @click="toggleWidth"
        />
      </CustomTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  appLogoIcon,
  narrowerIcon,
  notificationIcon,
  searchIcon,
  widerIcon,
} from "~/core/icons-map";

const { isFluid, toggleWidth } = useLayout();
</script>

<style></style>
