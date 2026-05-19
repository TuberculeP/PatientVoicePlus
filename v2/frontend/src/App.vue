<script setup lang="ts">
import TheFooter from './views/TheFooter.vue'
import TheHeader from './views/TheHeader.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <TheHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>
