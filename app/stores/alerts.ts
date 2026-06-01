import { defineStore } from "pinia";
import type { Metric } from "~/types/api";
import type { TagDataType, TagSettings, TagUiConfig } from "~/types/models";
import { evaluateTagStatus, type TagStatusLevel } from "~/utils/tagStatus";

interface TagMeta {
  name: string;
  dataType: TagDataType | undefined;
  ui: TagUiConfig | null;
}

/**
 * Пороговый движок: следит за live-метриками и поднимает уведомления при
 * пересечении порогов uiConfig. Edge-triggered (антидребезг): алерт срабатывает
 * один раз на переход между уровнями, а не на каждую метрику.
 */
export const useAlertsStore = defineStore("Alerts", () => {
  const notifications = useNotificationsStore();

  const meta = reactive(new Map<number, TagMeta>());
  const levels = reactive(new Map<number, TagStatusLevel>());

  /** Текущий уровень тега — для подсветки карточек в UI. */
  function levelOf(tagId: number): TagStatusLevel {
    return levels.get(tagId) ?? "unknown";
  }

  /** Перезагружает справочник тегов из API (вызывается на старте и при ConfigUpdated TAG). */
  async function refresh() {
    try {
      const tags = await useApi().tags.list();
      setTags(tags ?? []);
    } catch {
      // справочник не критичен для работы UI — молча игнорируем сбой загрузки
    }
  }

  /** Загружает справочник тегов (имя, тип, пороги) для оценки метрик. */
  function setTags(tags: TagSettings[]) {
    meta.clear();
    for (const t of tags) {
      if (t.tagId == null) continue;
      meta.set(t.tagId, {
        name: t.name || `Tag ${t.tagId}`,
        dataType: t.dataType,
        ui: t.uiConfigJson ?? null,
      });
    }
  }

  /** Тихо выставляет начальный уровень по снимку (без уведомлений) — для seed на загрузке. */
  function prime(metric: Metric) {
    const m = meta.get(metric.tagId);
    if (!m) return;
    levels.set(metric.tagId, evaluateTagStatus(metric.value, m.dataType, m.ui));
  }

  /** Оценивает метрику и при переходе уровня поднимает уведомление. */
  function onMetric(metric: Metric) {
    const m = meta.get(metric.tagId);
    if (!m) return;

    const next = evaluateTagStatus(metric.value, m.dataType, m.ui);
    const prev = levels.get(metric.tagId) ?? "unknown";
    if (next === prev) return;

    levels.set(metric.tagId, next);

    const val = m.dataType === "DIGITAL" ? (metric.value >= 0.5 ? 1 : 0) : metric.value;
    if (next === "critical") {
      notifications.add(m.name, `Critical threshold crossed (value ${val})`, "CRITICAL");
    } else if (next === "warning") {
      notifications.add(m.name, `Warning threshold crossed (value ${val})`, "WARNING");
    } else if (next === "normal" && (prev === "warning" || prev === "critical")) {
      notifications.add(m.name, `Returned to normal (value ${val})`, "INFO");
    }
  }

  return { meta, levels, levelOf, setTags, refresh, prime, onMetric };
});
