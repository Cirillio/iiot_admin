<script lang="ts" setup>
import type { LogStatusType } from "~/stores/app-logger";

definePageMeta({
  title: "App Logs",
  description: "Monitoring of application logs",
});

const appLogger = useAppLoggerStore();
const { logs } = storeToRefs(appLogger);

const search = ref("");
const activeStatuses = ref<Set<LogStatusType>>(new Set());
const activeTags = ref<Set<string>>(new Set());

const uniqueTags = computed(() => [...new Set(logs.value.map((l) => l.tag))].sort());

const filteredLogs = computed(() => {
  let result = [...logs.value].toReversed();

  if (activeStatuses.value.size > 0)
    result = result.filter((l) => activeStatuses.value.has(l.status));

  if (activeTags.value.size > 0)
    result = result.filter((l) => activeTags.value.has(l.tag));

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    result = result.filter(
      (l) => l.message.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q)
    );
  }

  return result;
});

const handleExport = () => {
  const blob = new Blob([JSON.stringify(appLogger.exportLogs(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `iiot-logs-${Date.now()}.json` });
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="flex h-full flex-col">
    <LogsToolbar
      v-model:search="search"
      v-model:active-statuses="activeStatuses"
      v-model:active-tags="activeTags"
      :unique-tags="uniqueTags"
      @clear="appLogger.clear()"
      @export="handleExport"
    />

    <div class="px-4 py-2 text-xs text-muted font-mono border-b border-default">
      {{ filteredLogs.length }} / {{ logs.length }} entries
    </div>

    <ScrollableWrapper>
      <div class="flex flex-col gap-3 p-4">
        <div v-if="filteredLogs.length === 0" class="text-center text-sm text-muted py-12">
          No logs match your filters
        </div>
        <LogsItem v-for="(log, i) in filteredLogs" :key="i" :log="log" />
      </div>
    </ScrollableWrapper>
  </div>
</template>
