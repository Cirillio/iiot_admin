<script lang="ts" setup>
import {
  cautionIcon,
  deleteIcon,
  errorIcon,
  exportIcon,
  filtersIcon,
  infoIcon,
  warningIcon,
} from "~/core/icons-map";

definePageMeta({
  title: "App Logs",
  description: "Monitoring of application logs",
});

const appLogger = useAppLoggerStore();

const { logs } = storeToRefs(appLogger);

const ICON_STATUS_MAP: Record<LogStatusType, string> = {
  general: infoIcon,
  warning: warningIcon,
  error: errorIcon,
  info: cautionIcon,
};

const COLOR_STATUS_MAP: Record<LogStatusType, string> = {
  general: "bg-muted/10 ring ring-default text-default",
  warning: "bg-amber-500/10 ring ring-amber-500/50 text-amber-500",
  error: "bg-rose-500/10 ring ring-rose-500/50 text-rose-500",
  info: "bg-sky-500/10 ring ring-sky-500/50 text-sky-500",
};

const logReversed = computed(() => [...logs.value].toReversed());

const filters = reactive<{
  logStatus?: LogStatusType;
  direction: "asc" | "desc";
}>({
  direction: "desc",
});
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex p-4 w-full justify-end gap-2 border-b border-default">
      <CustomTooltip
        :content="{
          align: 'end',
        }"
        :text="'Filters'"
      >
        <UButton :icon="filtersIcon" variant="outline" color="secondary" />
      </CustomTooltip>
      <CustomTooltip
        :content="{
          align: 'end',
        }"
        :text="'Clear Logs'"
      >
        <UButton
          variant="outline"
          :icon="deleteIcon"
          @click="appLogger.clear()"
        />
      </CustomTooltip>
      <CustomTooltip
        :content="{
          align: 'end',
        }"
        :text="'Export Logs'"
      >
        <UButton :icon="exportIcon" variant="outline" color="neutral" />
      </CustomTooltip>
    </div>
    <ScrollableWrapper>
      <div class="flex flex-col gap-4 p-4">
        <div
          v-for="(log, i) in logReversed"
          :key="i"
          class="rounded-md w-full flex items-center gap-2 p-4"
          :class="COLOR_STATUS_MAP[log.status]"
        >
          <UIcon
            :name="ICON_STATUS_MAP[log.status]"
            class="size-10 shrink-0 min-w-0"
          />
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-medium leading-tight">{{
              log.tag
            }}</span>
            <span class="text-base font-bold leading-tight">{{
              log.message
            }}</span>
          </div>
          <span class="ml-auto text-end text-sm font-semibold">
            {{ new Date(log.date).toLocaleString().replace(",", "") }}
          </span>
        </div>
      </div>
    </ScrollableWrapper>
  </div>
</template>
