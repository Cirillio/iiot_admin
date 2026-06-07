import type { TagDataType, TagUiConfig } from "~/types/models";

/** Уровень состояния значения тега относительно порогов из uiConfig. */
export type TagStatusLevel = "normal" | "warning" | "critical" | "unknown";

/** Базовый цвет по типу данных — когда в uiConfig цвет не задан. */
const TYPE_FALLBACK_COLOR: Record<TagDataType, string> = {
  ANALOG_RAW: "var(--color-info-500)",
  ANALOG_PHYSICAL: "var(--color-info-500)",
  DIGITAL: "var(--color-success-500)",
};

/** CSS-цвет уровня состояния — для значения, рамки, линий порогов. */
export const STATUS_COLOR: Record<Exclude<TagStatusLevel, "unknown">, string> = {
  normal: "var(--color-success-500)",
  warning: "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

const num = (v: number | null | undefined): v is number =>
  typeof v === "number" && Number.isFinite(v);

/**
 * Оценивает значение относительно порогов uiConfig.
 * Аналог: critical имеет приоритет над warning; пороги, не заданные в конфиге, игнорируются.
 * Digital: сравнение «включённого» состояния (>=0.5) с digitalWarning/digitalCritical.
 */
export function evaluateTagStatus(
  value: number | null | undefined,
  dataType: TagDataType | undefined,
  ui: TagUiConfig | null | undefined,
): TagStatusLevel {
  if (!num(value) || !ui) return "unknown";

  if (dataType === "DIGITAL") {
    const on = value >= 0.5 ? 1 : 0;
    if (num(ui.digitalCritical) && on === ui.digitalCritical) return "critical";
    if (num(ui.digitalWarning) && on === ui.digitalWarning) return "warning";
    return "normal";
  }

  if (
    (num(ui.minCritical) && value <= ui.minCritical) ||
    (num(ui.maxCritical) && value >= ui.maxCritical)
  )
    return "critical";

  if (
    (num(ui.minWarning) && value <= ui.minWarning) ||
    (num(ui.maxWarning) && value >= ui.maxWarning)
  )
    return "warning";

  return "normal";
}

/** Резолвит цвет тега: кастомный из uiConfig.color, иначе — цвет по типу данных. */
export function resolveTagColor(
  ui: TagUiConfig | null | undefined,
  dataType: TagDataType | undefined,
): string {
  if (ui?.color) return ui.color;
  return dataType ? TYPE_FALLBACK_COLOR[dataType] : "var(--color-info-500)";
}

/** Подпись DIGITAL-значения с учётом кастомных лейблов labelZero/labelOne. */
export function digitalLabel(
  value: number | null | undefined,
  ui: TagUiConfig | null | undefined,
): string {
  if (!num(value)) return "—";
  return value >= 0.5 ? (ui?.labelOne || "ON") : (ui?.labelZero || "OFF");
}

/** Одна линия порога для графика. */
export interface ThresholdLine {
  value: number;
  level: Exclude<TagStatusLevel, "unknown" | "normal">;
  label: string;
}

/** Горизонтальные линии порогов для аналогового графика (только заданные). */
export function thresholdLines(
  ui: TagUiConfig | null | undefined,
): ThresholdLine[] {
  if (!ui) return [];
  const lines: ThresholdLine[] = [];
  if (num(ui.maxCritical))
    lines.push({ value: ui.maxCritical, level: "critical", label: "max crit" });
  if (num(ui.maxWarning))
    lines.push({ value: ui.maxWarning, level: "warning", label: "max warn" });
  if (num(ui.minWarning))
    lines.push({ value: ui.minWarning, level: "warning", label: "min warn" });
  if (num(ui.minCritical))
    lines.push({ value: ui.minCritical, level: "critical", label: "min crit" });
  return lines;
}
