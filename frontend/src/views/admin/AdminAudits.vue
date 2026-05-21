<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminFetch } from '@/composables/useAdminApi'
import { apiFetch } from '@/composables/useApi'

type AuditStatus = 'DRAFT' | 'SENT' | 'DONE'

type Audit = {
  id: string
  title: string
  status: AuditStatus
  createdAt: string
  center: { name: string }
}

type Center = {
  id: string
  name: string
  city: string
}

const router = useRouter()

const audits = ref<Audit[]>([])
const centers = ref<Center[]>([])
const loading = ref(true)
const generating = ref(false)
const showModal = ref(false)
const selectedCenterId = ref('')
const mode = ref<'manual' | 'ai'>('manual')
const dateFrom = ref('')
const dateTo = ref('')
const aiSuccess = ref(false)
const error = ref<string | null>(null)

async function fetchAudits() {
  loading.value = true
  try {
    const res = await adminFetch('/audits')
    audits.value = await res.json()
  } finally {
    loading.value = false
  }
}

async function fetchCenters() {
  const res = await apiFetch('/centers')
  centers.value = await res.json()
}

async function generateAudit() {
  if (!selectedCenterId.value) return
  generating.value = true
  error.value = null

  if (mode.value === 'ai') {
    if (!dateFrom.value || !dateTo.value) {
      error.value = 'Veuillez renseigner les deux dates.'
      generating.value = false
      return
    }
    try {
      const res = await adminFetch('/audits/generate-ai', {
        method: 'POST',
        body: JSON.stringify({
          centerId: selectedCenterId.value,
          dateFrom: dateFrom.value,
          dateTo: dateTo.value,
        }),
      })
      if (!res.ok) {
        error.value = 'Erreur lors du déclenchement.'
        return
      }
      aiSuccess.value = true
      await fetchAudits()
    } catch {
      error.value = 'Impossible de contacter le serveur.'
    } finally {
      generating.value = false
    }
  } else {
    try {
      const res = await adminFetch('/audits/generate', {
        method: 'POST',
        body: JSON.stringify({ centerId: selectedCenterId.value }),
      })
      if (!res.ok) {
        error.value = 'Erreur lors de la génération.'
        return
      }
      const audit: Audit = await res.json()
      await router.push({ name: 'admin-audit-detail', params: { id: audit.id } })
    } catch {
      error.value = 'Impossible de contacter le serveur.'
    } finally {
      generating.value = false
    }
  }
}

function openModal() {
  selectedCenterId.value = ''
  mode.value = 'manual'
  dateFrom.value = ''
  dateTo.value = ''
  aiSuccess.value = false
  error.value = null
  showModal.value = true
}

const STATUS_LABEL: Record<AuditStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  DONE: 'Traité',
}

const STATUS_CLASS: Record<AuditStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchAudits()
  fetchCenters()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-1">
          Audits
        </h1>
        <p class="text-gray-500">
          Suivi et génération des audits par établissement.
        </p>
      </div>
      <button
        type="button"
        class="bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        @click="openModal"
      >
        Générer un audit
      </button>
    </div>

    <div
      v-if="loading"
      class="text-gray-400 text-sm"
    >
      Chargement…
    </div>

    <div
      v-else-if="audits.length === 0"
      class="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400"
    >
      Aucun audit pour le moment.
    </div>

    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 text-left text-gray-500 text-xs font-medium uppercase tracking-wide">
            <th class="px-5 py-3">
              Établissement
            </th>
            <th class="px-5 py-3">
              Titre
            </th>
            <th class="px-5 py-3">
              Statut
            </th>
            <th class="px-5 py-3">
              Date
            </th>
            <th class="px-5 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="audit in audits"
            :key="audit.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-5 py-4 font-medium text-gray-800">
              {{ audit.center.name }}
            </td>
            <td class="px-5 py-4 text-gray-600">
              {{ audit.title }}
            </td>
            <td class="px-5 py-4">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="STATUS_CLASS[audit.status]"
              >
                {{ STATUS_LABEL[audit.status] }}
              </span>
            </td>
            <td class="px-5 py-4 text-gray-500">
              {{ formatDate(audit.createdAt) }}
            </td>
            <td class="px-5 py-4 text-right">
              <RouterLink
                :to="{ name: 'admin-audit-detail', params: { id: audit.id } }"
                class="text-teal-700 hover:underline font-medium"
              >
                Voir
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modale génération -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
          <h2 class="text-lg font-semibold text-gray-800">
            Générer un audit
          </h2>

          <!-- Succès IA -->
          <div
            v-if="aiSuccess"
            class="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-800"
          >
            Génération lancée. L'audit apparaîtra dans la liste dans quelques instants.
          </div>

          <template v-else>
            <!-- Toggle mode -->
            <div class="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
              <button
                type="button"
                class="flex-1 py-2 transition-colors"
                :class="mode === 'manual' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-50'"
                @click="mode = 'manual'"
              >
                Manuel
              </button>
              <button
                type="button"
                class="flex-1 py-2 transition-colors"
                :class="mode === 'ai' ? 'bg-teal-700 text-white' : 'text-gray-600 hover:bg-gray-50'"
                @click="mode = 'ai'"
              >
                Générer par IA
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Établissement
              </label>
              <select
                v-model="selectedCenterId"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option
                  value=""
                  disabled
                >
                  Sélectionner…
                </option>
                <option
                  v-for="c in centers"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.name }} — {{ c.city }}
                </option>
              </select>
            </div>

            <template v-if="mode === 'ai'">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Du
                  </label>
                  <input
                    v-model="dateFrom"
                    type="date"
                    class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Au
                  </label>
                  <input
                    v-model="dateTo"
                    type="date"
                    class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  >
                </div>
              </div>
              <p class="text-xs text-gray-400">
                Seuls les avis avec une analyse complète (statut DONE) seront inclus.
              </p>
            </template>

            <p
              v-if="error"
              class="text-sm text-red-600"
              role="alert"
            >
              {{ error }}
            </p>

            <div class="flex gap-3 justify-end">
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                @click="showModal = false"
              >
                Annuler
              </button>
              <button
                type="button"
                :disabled="!selectedCenterId || generating"
                class="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="generateAudit"
              >
                {{ generating ? 'Lancement…' : (mode === 'ai' ? 'Lancer la génération' : 'Générer') }}
              </button>
            </div>
          </template>

          <div
            v-if="aiSuccess"
            class="flex justify-end"
          >
            <button
              type="button"
              class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              @click="showModal = false"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
