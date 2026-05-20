<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminFetch } from '../../composables/useAdminApi'
import type { AdminCenter } from '../../types'

const centers = ref<AdminCenter[]>([])
const loading = ref(true)
const error = ref(false)

const stats = computed(() => ({
  total: centers.value.length,
  active: centers.value.filter((c) => c.isActive).length,
  inactive: centers.value.filter((c) => !c.isActive).length,
}))

onMounted(async () => {
  try {
    const res = await adminFetch('/centers')
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
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-2">
      Tableau de bord
    </h1>
    <p class="text-gray-500 mb-8">
      Vue d’ensemble de l’administration PatientVoice.
    </p>

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
      Impossible de charger les statistiques.
    </div>
    <template v-else>
      <div class="grid gap-4 sm:grid-cols-3 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">
            Total établissements
          </p>
          <p class="text-3xl font-bold text-gray-800">
            {{ stats.total }}
          </p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">
            Actifs
          </p>
          <p class="text-3xl font-bold text-teal-700">
            {{ stats.active }}
          </p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">
            Désactivés
          </p>
          <p class="text-3xl font-bold text-gray-600">
            {{ stats.inactive }}
          </p>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <RouterLink
          to="/admin/establishments"
          class="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-teal-400 transition-colors group"
        >
          <h2 class="font-semibold text-gray-800 mb-2 group-hover:text-teal-700">
            Établissements
          </h2>
          <p class="text-sm text-gray-600 mb-4">
            Consulter, créer et modifier les centres de rééducation.
          </p>
          <span class="text-sm font-medium text-teal-700">
            Gérer les établissements →
          </span>
        </RouterLink>

        <RouterLink
          to="/admin/establishments/new"
          class="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-teal-400 transition-colors group"
        >
          <h2 class="font-semibold text-gray-800 mb-2 group-hover:text-teal-700">
            Nouvel établissement
          </h2>
          <p class="text-sm text-gray-600 mb-4">
            Ajouter un centre visible sur le site public.
          </p>
          <span class="text-sm font-medium text-teal-700">
            Créer un établissement →
          </span>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
