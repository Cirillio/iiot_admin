<script setup lang="ts">
// Catch-all route for 404 errors within the app shell
throw createError({
  statusCode: 404,
  statusMessage: 'Page Not Found',
  fatal: false // Важно: false, чтобы не выбивало в корень error.vue
})
</script>

<template>
  <div />
</template>
