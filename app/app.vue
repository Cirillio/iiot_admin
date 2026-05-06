<template>
  <UApp>
    <div class="size-full">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </UApp>
</template>

<style>
@keyframes grid-drift {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -40px 40px;
  }
}

body {
  background-image: radial-gradient(
    circle,
    var(--ui-color-neutral-500) 1px,
    transparent 1px
  );
  background-size: 40px 40px;
  animation: grid-drift 6s linear infinite;
}
</style>
