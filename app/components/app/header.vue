<template>
  <header
    class="border-b max-lg:flex-col-reverse border-default w-full flex items-center gap-4 px-6 py-8 justify-between"
  >
    <div class="flex max-lg:text-center flex-col gap-1">
      <template v-if="isIndex">
        <h2
          class="text-2xl uppercase max-lg:mr-auto w-fit lg:text-4xl font-bold font-mono text-default flex items-end gap-2"
        >
          {{ greeting }},
          <span class="text-secondary flex"
            >{{ user.name }} <span class="text-default">!</span></span
          >
        </h2>
        <p class="text-sm text-default/50 font-mono">
          Welcome back to IIoT Control Panel
        </p>
      </template>
      <template v-else>
        <h2
          class="text-2xl max-lg:mr-auto w-fit lg:text-4xl font-bold font-mono text-default flex items-end gap-2 uppercase"
        >
          {{ pageTitle }}
        </h2>
        <p class="text-sm text-default/50 font-mono">
          {{ pageDescription }}
        </p>
      </template>
    </div>

    <NuxtLink
      to="/profile"
      class="flex max-lg:ml-auto gap-2 items-center rounded-md hover:bg-elevated pl-4 pr-2 py-2.5"
    >
      <div class="text-end flex flex-col justify-between">
        <span class="leading-tight text-secondary text-xs">{{
          user.role
        }}</span>
        <span class="text-lg leading-tight font-medium">{{ user.name }}</span>
      </div>
      <UAvatar :src="user.avatar" class="size-10 ml-2" />
    </NuxtLink>
  </header>
</template>

<script lang="ts" setup>
import type { MOCK_USER } from "~/mock";

type Props = {
  user: typeof MOCK_USER;
};

defineProps<Props>();

const route = useRoute();

const isIndex = computed(() => route.path === "/");
const pageTitle = computed(() => route.meta.title || "Dashboard");
const pageDescription = computed(
  () => route.meta.description || "IIoT System Monitoring",
);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});
</script>
