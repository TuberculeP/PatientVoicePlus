<script setup lang="ts">
import AdminSidebar from '../views/admin/AdminSidebar.vue'
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 text-gray-900">
    <AdminSidebar />
    <main class="flex-1 min-w-0 overflow-auto pt-14 md:pt-0">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
