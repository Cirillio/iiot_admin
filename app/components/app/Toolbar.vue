<script lang="ts" setup>
import { appLogoIcon, narrowerIcon, widerIcon } from "~/core/icons-map";

const { isFluid, toggleWidth } = useLayout();
const route = useRoute();

const pageTitle = computed(
  () => (route.meta.title as string | undefined) ?? "IIoT System",
);
const pageDescription = computed(
  () => route.meta.description as string | undefined,
);
</script>

<template>
  <CustomCard class="justify-between py-2 px-4">
    <!-- Left: Logo + page identity -->
    <div class="flex items-center gap-3 min-w-0">
      <Icon :name="appLogoIcon" class="text-primary size-5 shrink-0" />
      <USeparator orientation="vertical" class="h-6" />
      <div class="flex flex-col min-w-0 leading-tight">
        <span class="font-mono font-semibold text-sm truncate">{{
          pageTitle
        }}</span>
        <span
          v-if="pageDescription"
          class="text-xs text-muted truncate hidden sm:block"
          >{{ pageDescription }}</span
        >
      </div>
    </div>

    <!-- Right: Controls -->
    <div class="flex items-center gap-1 shrink-0">
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
