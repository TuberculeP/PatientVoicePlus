<script setup lang="ts">
import { ref } from 'vue'

const menuOpen = ref(false)
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <nav class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <RouterLink to="/" class="text-teal-700 font-bold text-xl tracking-tight">
        PatientVoice
      </RouterLink>

      <div class="hidden md:flex gap-6 text-sm font-medium">
        <RouterLink
          to="/"
          class="text-gray-600 hover:text-teal-700 transition-colors"
          active-class="text-teal-700"
        >
          Accueil
        </RouterLink>
        <RouterLink
          to="/centers"
          class="text-gray-600 hover:text-teal-700 transition-colors"
          active-class="text-teal-700"
        >
          Les centres
        </RouterLink>
        <RouterLink
          to="/contact"
          class="text-gray-600 hover:text-teal-700 transition-colors"
          active-class="text-teal-700"
        >
          Contact
        </RouterLink>
      </div>

      <button
        class="md:hidden p-2 rounded text-gray-500 hover:text-teal-700"
        :aria-expanded="menuOpen"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            v-if="!menuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>

    <div v-if="menuOpen" class="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
      <RouterLink to="/" class="text-gray-700 hover:text-teal-700" @click="menuOpen = false">
        Accueil
      </RouterLink>
      <RouterLink to="/centers" class="text-gray-700 hover:text-teal-700" @click="menuOpen = false">
        Les centres
      </RouterLink>
      <RouterLink to="/contact" class="text-gray-700 hover:text-teal-700" @click="menuOpen = false">
        Contact
      </RouterLink>
    </div>
  </header>
</template>
