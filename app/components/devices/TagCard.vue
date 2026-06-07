<script setup lang="ts">
import { chartIcon, editIcon, paletteIcon, warningIcon } from "~/core/icons-map";
import type { TagSettings } from "~/types/models";
import { COMMAND_STATUS, type CommandStatus } from "~/types/api";
import { isWritableTag, registerBadge, type WritableTag } from "~/utils/tag";
import {
  digitalLabel,
  evaluateTagStatus,
  resolveTagColor,
  STATUS_COLOR,
} from "~/utils/tagStatus";

const props = defineProps<{ item: TagSettings }>();

const emit = defineEmits<{
  (e: "edit" | "appearance", tag: TagSettings): void;
}>();

const rt = useRealTimeStore();
const commands = useCommandsStore();

const metric = computed(() =>
  props.item.tagId != null ? rt.getMetricByTagId(props.item.tagId) : undefined,
);

const rawValue = computed(() => metric.value?.value ?? null);
const isDigital = computed(() => props.item.dataType === "DIGITAL");
const ui = computed(() => props.item.uiConfigJson ?? null);

const status = computed(() =>
  evaluateTagStatus(rawValue.value, props.item.dataType, ui.value),
);

const displayValue = computed(() => {
  if (rawValue.value == null) return null;
  if (isDigital.value) return digitalLabel(rawValue.value, ui.value);
  return Number(rawValue.value).toFixed(2);
});

// Базовый цвет тега из uiConfig (или по типу) — без подмены на цвет тревоги.
const baseColor = computed(() => resolveTagColor(ui.value, props.item.dataType));

const accentColor = computed(() => {
  if (status.value === "critical") return STATUS_COLOR.critical;
  if (status.value === "warning") return STATUS_COLOR.warning;
  return baseColor.value;
});

const valueColor = computed(() =>
  displayValue.value == null ? undefined : accentColor.value,
);

const isAlarm = computed(
  () => status.value === "warning" || status.value === "critical",
);

const trend = computed(() =>
  props.item.tagId != null ? rt.getTrend(props.item.tagId) : [],
);

const regBadge = computed(() => registerBadge(props.item.registerType));

// Пороги из uiConfig для отображения чипами (только аналоговые, только заданные).
const num = (v: number | null | undefined): v is number =>
  typeof v === "number" && Number.isFinite(v);

const thresholdChips = computed(() => {
  const u = ui.value;
  if (!u || isDigital.value) return [];
  const chips: { label: string; color: string; title: string }[] = [];
  if (num(u.minCritical))
    chips.push({ label: `≤ ${u.minCritical}`, color: STATUS_COLOR.critical, title: "min critical" });
  if (num(u.minWarning))
    chips.push({ label: `≤ ${u.minWarning}`, color: STATUS_COLOR.warning, title: "min warning" });
  if (num(u.maxWarning))
    chips.push({ label: `≥ ${u.maxWarning}`, color: STATUS_COLOR.warning, title: "max warning" });
  if (num(u.maxCritical))
    chips.push({ label: `≥ ${u.maxCritical}`, color: STATUS_COLOR.critical, title: "max critical" });
  return chips;
});

// Управление: только для записываемых регистров (Coil / Holding).
const writableTag = computed<WritableTag | null>(() =>
  isWritableTag(props.item) ? props.item : null,
);

const isCoil = computed(() => props.item.registerType === "COIL");

const lastCommand = computed(() =>
  props.item.tagId != null ? commands.getByTagId(props.item.tagId) : undefined,
);

const CMD_META: Record<
  CommandStatus,
  { label: string; color: "neutral" | "info" | "success" | "error" }
> = {
  PENDING: { label: "В очереди", color: "neutral" },
  PROCESSING: { label: "Выполняется", color: "info" },
  SUCCESS: { label: "Успешно", color: "success" },
  FAILED: { label: "Ошибка", color: "error" },
};
</script>

<template>
  <div
    class="group relative flex flex-col rounded-lg border bg-elevated/20 overflow-hidden transition-colors hover:bg-elevated/40"
    :class="isAlarm ? '' : 'border-default hover:border-tertiary/30'"
    :style="isAlarm ? { borderColor: accentColor } : undefined"
  >
    <!-- Type / status accent bar -->
    <div class="h-1 w-full shrink-0" :style="{ backgroundColor: accentColor }" />

    <div class="flex flex-col gap-3 p-4">
      <!-- Port + actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <UBadge
            variant="outline"
            color="neutral"
            size="xs"
            class="font-mono tabular-nums"
          >
            P{{ item.portNumber }}
          </UBadge>
          <UBadge
            v-if="regBadge"
            :color="regBadge.color"
            variant="soft"
            size="xs"
            class="font-mono"
            :title="regBadge.full"
          >
            {{ regBadge.label }}<span class="opacity-60 ml-1">{{ regBadge.rw ? "RW" : "RO" }}</span>
          </UBadge>
          <UIcon
            v-if="isAlarm"
            :name="warningIcon"
            class="size-4"
            :style="{ color: accentColor }"
          />
        </div>
        <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <UButton
            v-if="item.tagId != null"
            :icon="chartIcon"
            :to="`/tags/${item.tagId}`"
            size="xs"
            variant="ghost"
            color="neutral"
            title="Открыть страницу датчика"
          />
          <UButton
            :icon="paletteIcon"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="emit('appearance', item)"
          />
          <UButton
            :icon="editIcon"
            size="xs"
            variant="ghost"
            color="neutral"
            @click="emit('edit', item)"
          />
        </div>
      </div>

      <!-- Value block -->
      <div class="flex flex-col gap-0.5">
        <span
          class="text-4xl font-mono font-bold tabular-nums leading-none tracking-tight transition-colors"
          :class="displayValue == null ? 'text-muted/30' : ''"
          :style="valueColor ? { color: valueColor } : undefined"
        >
          {{ displayValue ?? "—" }}
        </span>
        <span
          v-if="item.unit && !isDigital"
          class="text-sm text-muted uppercase tracking-wider font-mono"
        >
          {{ item.unit }}
        </span>
      </div>

      <!-- Live trend (session) -->
      <ChartsSparkline :values="trend" :color="accentColor" :height="28" />

      <!-- Thresholds from uiConfig -->
      <div v-if="thresholdChips.length" class="flex flex-wrap gap-1">
        <span
          v-for="(chip, i) in thresholdChips"
          :key="i"
          :title="chip.title"
          class="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono tabular-nums"
          :style="{ color: chip.color, borderColor: chip.color }"
        >
          {{ chip.label }}
        </span>
      </div>

      <!-- Supervisory control (writable tags only) -->
      <div
        v-if="writableTag"
        class="flex flex-col gap-2 border-t border-default/50 pt-3"
      >
        <ControlCoilToggle v-if="isCoil" :tag="writableTag" />
        <ControlHoldingSetpoint v-else :tag="writableTag" />

        <div v-if="lastCommand" class="flex items-center gap-2">
          <UBadge
            :color="CMD_META[lastCommand.status].color"
            variant="soft"
            size="xs"
          >
            {{ CMD_META[lastCommand.status].label }}
          </UBadge>
          <span
            v-if="lastCommand.status === COMMAND_STATUS.FAILED && lastCommand.errorMessage"
            class="text-xs text-error-400 truncate"
            :title="lastCommand.errorMessage"
          >
            {{ lastCommand.errorMessage }}
          </span>
        </div>
      </div>

      <!-- Tag name + slug (link to detail) -->
      <div class="flex items-center gap-2 border-t border-default/50 pt-3">
        <span
          class="size-2.5 shrink-0 rounded-full"
          :style="{ backgroundColor: baseColor }"
          title="Цвет датчика (uiConfig)"
        />
        <div class="flex flex-col gap-0.5 min-w-0">
          <NuxtLink
            v-if="item.tagId != null"
            :to="`/tags/${item.tagId}`"
            class="text-sm font-semibold leading-tight truncate hover:text-primary transition-colors"
          >
            {{ item.name || "Unnamed tag" }}
          </NuxtLink>
          <span v-else class="text-sm font-semibold leading-tight truncate">
            {{ item.name || "Unnamed tag" }}
          </span>
          <span v-if="item.slug" class="text-xs font-mono text-muted/60 truncate">
            {{ item.slug }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
