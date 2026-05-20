<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminFetch } from '../../../composables/useAdminApi'
import type { AdminCenter, CenterFormData } from '../../../types'
import AdminEstablishmentForm from './AdminEstablishmentForm.vue'

const route = useRoute()
const router = useRouter()

const initial = ref<CenterFormData | undefined>()
const center = ref<AdminCenter | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await adminFetch(`/centers/${route.params.id}`)
    if (!res.ok) throw new Error()
    const data: AdminCenter = await res.json()
    center.value = data
    initial.value = {
      name: data.name,
      description: data.description,
      city: data.city,
      postalCode: data.postalCode,
      address: data.address,
      specialtyIds: [...data.specialtyIds],
    }
  } catch {
    error.value = 'Établissement introuvable.'
  } finally {
    loading.value = false
  }
}

async function onSubmit(data: CenterFormData) {
  submitting.value = true
  error.value = null
  try {
    const res = await adminFetch(`/centers/${route.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      error.value = 'Impossible d’enregistrer les modifications.'
      return
    }
    await router.push('/admin/establishments')
  } catch {
    error.value = 'Impossible de contacter le serveur.'
  } finally {
    submitting.value = false
  }
}

async function toggleActive() {
  if (!center.value) return
  actionLoading.value = true
  try {
    const path = center.value.isActive
      ? `/centers/${center.value.id}/deactivate`
      : `/centers/${center.value.id}/activate`
    const res = await adminFetch(path, { method: 'PATCH' })
    if (!res.ok) throw new Error()
    await load()
  } catch {
    error.value = 'Impossible de modifier le statut.'
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <RouterLink
      to="/admin/establishments"
      class="text-sm text-teal-700 hover:underline mb-6 inline-block"
    >
      ← Retour à la liste
    </RouterLink>

    <div
      v-if="loading"
      class="text-gray-500"
    >
      Chargement…
    </div>
    <template v-else-if="initial && center">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Modifier l’établissement
          </h1>
          <p class="text-gray-500">
            {{ center.name }}
          </p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
          :class="
            center.isActive
              ? 'bg-teal-50 text-teal-800'
              : 'bg-gray-100 text-gray-600'
          "
        >
          {{ center.isActive ? 'Actif' : 'Désactivé' }}
        </span>
      </div>

      <p
        v-if="error"
        class="text-sm text-red-600 mb-4"
        role="alert"
      >
        {{ error }}
      </p>

      <AdminEstablishmentForm
        :initial="initial"
        submit-label="Enregistrer"
        :loading="submitting"
        @submit="onSubmit"
      >
        <template #actions>
          <RouterLink
            to="/admin/establishments"
            class="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-teal-400 transition-colors"
          >
            Annuler
          </RouterLink>
          <button
            type="button"
            class="rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
            :class="
              center.isActive
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-teal-200 text-teal-700 hover:bg-teal-50'
            "
            :disabled="actionLoading"
            @click="toggleActive"
          >
            {{
              actionLoading
                ? '…'
                : center.isActive
                  ? 'Désactiver'
                  : 'Réactiver'
            }}
          </button>
        </template>
      </AdminEstablishmentForm>
    </template>
  </div>
</template>
