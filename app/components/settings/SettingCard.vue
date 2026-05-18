<script lang="ts" setup>
const props = defineProps<{
  icon: string;
  label: string;
  description: string;
  unit?: string;
  modelValue: number;
  savedValue: number;
  min?: number;
  step?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const editing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const isDirty = computed(() => props.modelValue !== props.savedValue);

const inputVal = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => (inputVal.value = v),
);

const startEdit = () => {
  inputVal.value = props.modelValue;
  editing.value = true;
  nextTick(() => inputRef.value?.select());
};

const commit = () => {
  const parsed = Number(inputVal.value);
  if (!isNaN(parsed) && parsed >= (props.min ?? 0)) {
    emit("update:modelValue", parsed);
  } else {
    inputVal.value = props.modelValue;
  }
  editing.value = false;
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter") commit();
  if (e.key === "Escape") {
    inputVal.value = props.modelValue;
    editing.value = false;
  }
};
</script>

<template>
  <div
    class="group relative flex flex-col gap-3 rounded-sm border p-4 cursor-pointer transition-all duration-200"
    :class="[
      isDirty
        ? 'border-amber-500/40 bg-amber-500/5'
        : 'border-default bg-transparent hover:border-muted/40',
    ]"
    @click="!editing && startEdit()"
  >
    <!-- dirty dot -->
    <span
      v-if="isDirty"
      class="absolute top-3 right-3 size-1.5 rounded-full bg-amber-400"
    />

    <!-- header -->
    <div class="flex items-center gap-2">
      <UIcon :name="icon" class="size-4 text-muted shrink-0" :class="isDirty && 'text-amber-400'" />
      <span class="text-[11px] font-semibold uppercase tracking-widest text-muted" :class="isDirty && 'text-amber-400/80'">
        {{ label }}
      </span>
    </div>

    <!-- value -->
    <div class="flex items-end gap-1.5 min-h-[2.5rem]">
      <template v-if="!editing">
        <span
          class="text-3xl font-mono leading-none transition-colors"
          :class="isDirty ? 'text-amber-300' : 'text-default group-hover:text-amber-400'"
        >
          {{ modelValue }}
        </span>
        <span v-if="unit" class="text-xs text-muted mb-1">{{ unit }}</span>
      </template>
      <template v-else>
        <input
          ref="inputRef"
          v-model.number="inputVal"
          type="number"
          :min="min"
          :step="step ?? 1"
          class="w-full bg-transparent text-3xl font-mono leading-none outline-none border-b border-amber-400 text-amber-300 pb-0.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          @blur="commit"
          @keydown="onKeydown"
          @click.stop
        />
        <span v-if="unit" class="text-xs text-muted mb-1 shrink-0">{{ unit }}</span>
      </template>
    </div>

    <!-- description -->
    <p class="text-[11px] text-muted/60 leading-tight">{{ description }}</p>
  </div>
</template>
