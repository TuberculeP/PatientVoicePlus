<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Center } from '../types'

const centers = ref<Center[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('/api/centers')
    if (!res.ok) throw new Error()
    centers.value = await res.json()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Centres de rééducation</h1>
    <p class="text-gray-500 mb-10">Trouvez un centre et partagez votre expérience.</p>

    <div v-if="loading" class="text-gray-500">Chargement…</div>
    <div v-else-if="error" class="text-red-600">Impossible de charger les centres.</div>
    <div v-else-if="centers.length === 0" class="text-gray-500">Aucun centre disponible.</div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RouterLink
        v-for="center in centers"
        :key="center.id"
        :to="`/center/${center.id}`"
        class="block bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-400 hover:shadow-sm transition"
      >
        <h2 class="font-semibold text-gray-800 mb-1">{{ center.name }}</h2>
        <p class="text-sm text-gray-500 mb-3">{{ center.address }}, {{ center.postalCode }} {{ center.city }}</p>
        <p class="text-xs text-teal-700 font-medium">Voir le centre →</p>
      </RouterLink>
    </div>
  </div>
</template>
