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
  <section class="bg-teal-700 text-white py-20 px-4 text-center">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold mb-4">
        Donnez votre avis sur votre centre de rééducation
      </h1>
      <p class="text-teal-100 text-lg mb-8">
        Aidez les futurs patients à choisir leur centre en partageant votre expérience.
      </p>
      <RouterLink
        to="/centers"
        class="inline-block bg-white text-teal-700 font-semibold px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors"
      >
        Voir les centres
      </RouterLink>
    </div>
  </section>

  <section class="max-w-6xl mx-auto px-4 py-16">
    <h2 class="text-2xl font-bold text-gray-800 mb-8">
      Centres récents
    </h2>

    <div
      v-if="loading"
      class="text-gray-500"
    >
      Chargement…
    </div>
    <div
      v-else-if="error"
      class="text-red-600"
    >
      Impossible de charger les centres.
    </div>
    <div
      v-else
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <RouterLink
        v-for="center in centers.slice(0, 3)"
        :key="center.id"
        :to="`/center/${center.id}`"
        class="block bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-400 hover:shadow-sm transition"
      >
        <h3 class="font-semibold text-gray-800 mb-1">
          {{ center.name }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ center.city }} · {{ center.postalCode }}
        </p>
      </RouterLink>
    </div>

    <div class="mt-8 text-center">
      <RouterLink
        to="/centers"
        class="text-teal-700 font-medium hover:underline"
      >
        Voir tous les centres →
      </RouterLink>
    </div>
  </section>

  <section class="bg-gray-100 py-16 px-4">
    <div class="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
      <div>
        <p class="text-3xl font-bold text-teal-700 mb-2">
          100%
        </p>
        <p class="text-gray-600 text-sm">
          Avis vérifiés par des patients
        </p>
      </div>
      <div>
        <p class="text-3xl font-bold text-teal-700 mb-2">
          Gratuit
        </p>
        <p class="text-gray-600 text-sm">
          Accès libre pour tous
        </p>
      </div>
      <div>
        <p class="text-3xl font-bold text-teal-700 mb-2">
          Anonyme
        </p>
        <p class="text-gray-600 text-sm">
          Votre vie privée est protégée
        </p>
      </div>
    </div>
  </section>
</template>
