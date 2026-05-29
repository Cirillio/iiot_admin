import { MODBUS_REGISTER_TYPE } from "~/types/models";
import type { TagSettings } from "~/types/models";

/** Тег, гарантированно пригодный для записи: есть PK и регистр RW (Coil/Holding). */
export type WritableTag = TagSettings & { tagId: number };

/**
 * Type-guard: тег доступен для записи только если у него есть tagId и
 * его регистр — Coil (0X) или Holding (4X). Discrete Input / Input Register — read-only.
 */
export function isWritableTag(tag: TagSettings): tag is WritableTag {
  return (
    tag.tagId != null &&
    (tag.registerType === MODBUS_REGISTER_TYPE.COIL ||
      tag.registerType === MODBUS_REGISTER_TYPE.HOLDING_REGISTER)
  );
}
