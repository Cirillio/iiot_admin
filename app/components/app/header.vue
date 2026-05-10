<template>
  <header
    class="border-b border-default w-full flex items-center gap-4 px-6 py-8 justify-between"
  >
    <div class="flex flex-col gap-1">
      <h2
        class="text-4xl font-bold font-mono text-default flex items-center gap-2"
      >
        {{ greeting }},
        <span class="text-secondary flex"
          >{{ user.name }} <span class="text-default">!</span></span
        >
      </h2>
      <p class="text-sm text-default/50 font-mono">
        Welcome back to IIoT Control Panel
      </p>
    </div>

    <UPopover>
      <button
        class="flex gap-2 items-center rounded-md hover:bg-elevated pl-4 pr-2 py-2.5"
      >
        <div class="text-end flex flex-col justify-between">
          <span class="leading-tight text-secondary text-xs">{{
            user.role
          }}</span>
          <span class="text-lg leading-tight font-medium">{{ user.name }}</span>
        </div>
        <UAvatar :src="user.avatar" class="size-10 ml-2" />
        <Icon :name="chevronUpDownIcon" class="size-6 text-default/50" />
      </button>

      <template #content>
        <div class="grid py-1 font-mono">
          <span class="text-sm uppercase text-center text-default/75"
            >Menu</span
          >
          <USeparator class="my-1" />
          <UButton
            to="/profile"
            size="lg"
            label="Profile"
            variant="ghost"
            color="neutral"
            :icon="userIcon"
          />

          <USeparator class="my-1" />

          <UButton
            to="/logout"
            size="lg"
            label="Logout"
            variant="ghost"
            color="error"
            :trailing-icon="arrowRightIcon"
          />
        </div>
      </template>
    </UPopover>
  </header>
</template>

<script lang="ts" setup>
import { chevronUpDownIcon, userIcon, arrowRightIcon } from "~/core/icons-map";
import type { MOCK_USER } from "~/mock";

type Props = {
  user: typeof MOCK_USER;
};

defineProps<Props>();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});
</script>
