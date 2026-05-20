<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminFetch } from '../../composables/useAdminApi'
import type { AdminCenter, AdminFormListItem } from '../../types'

const centers = ref<AdminCenter[]>([])
const forms = ref<AdminFormListItem[]>([])
const loading = ref(true)
const error = ref(false)

const stats = computed(() => ({
  centersTotal: centers.value.length,
  centersActive: centers.value.filter((c) => c.isActive).length,
  returnsTotal: forms.value.length,
}))

onMounted(async () => {
  try {
    const [centersRes, formsRes] = await Promise.all([
      adminFetch('/centers'),
      adminFetch('/forms'),
    ])
    if (!centersRes.ok || !formsRes.ok) throw new Error()
    centers.value = await centersRes.json()
    forms.value = await formsRes.json()
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
      <div class="grid gap-4 sm:grid-cols-2 mb-8">
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">
            Établissements
          </p>
          <p class="text-3xl font-bold text-gray-800">
            {{ stats.centersTotal }}
          </p>
          <p class="text-xs text-teal-700 mt-1">
            {{ stats.centersActive }} actifs
          </p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">
            Retours patients
          </p>
          <p class="text-3xl font-bold text-teal-700">
            {{ stats.returnsTotal }}
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
          to="/admin/returns"
          class="block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-teal-400 transition-colors group"
        >
          <h2 class="font-semibold text-gray-800 mb-2 group-hover:text-teal-700">
            Retours
          </h2>
          <p class="text-sm text-gray-600 mb-4">
            Consulter les avis patients et les désactiver si besoin.
          </p>
          <span class="text-sm font-medium text-teal-700">
            Gérer les retours →
          </span>
        </RouterLink>
      </div>
    </template>
  </div>
</template>
