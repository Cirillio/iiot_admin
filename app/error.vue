<script setup lang="ts">
import type { NuxtError } from "#app";

const { error } = defineProps<{
  error: NuxtError;
}>();

const handleError = () => clearError({ redirect: "/" });

useHead({
  title: `${error.message} | IIoT`,
});
</script>

<template>
  <UApp>
    <div class="min-h-screen flex flex-col bg-background text-foreground">
      <UError
        :error="error"
        :clear="{
          label: 'Back to home',
          color: 'primary',
          variant: 'solid',
        }"
        @clear="handleError"
      />
    </div>
  </UApp>
</template>
