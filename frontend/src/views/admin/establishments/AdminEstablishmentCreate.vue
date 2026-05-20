<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminFetch } from '../../../composables/useAdminApi'
import type { CenterFormData } from '../../../types'
import AdminEstablishmentForm from './AdminEstablishmentForm.vue'

const router = useRouter()
const submitting = ref(false)
const error = ref<string | null>(null)

async function onSubmit(data: CenterFormData) {
  submitting.value = true
  error.value = null
  try {
    const res = await adminFetch('/centers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      error.value = 'Impossible de créer l’établissement.'
      return
    }
    await router.push('/admin/establishments')
  } catch {
    error.value = 'Impossible de contacter le serveur.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <RouterLink
      to="/admin/establishments"
      class="text-sm text-teal-700 hover:underline mb-6 inline-block"
    >
      ← Retour à la liste
    </RouterLink>

    <h1 class="text-3xl font-bold text-gray-800 mb-2">
      Nouvel établissement
    </h1>
    <p class="text-gray-500 mb-8">
      Créez un centre visible sur le site public.
    </p>

    <p
      v-if="error"
      class="text-sm text-red-600 mb-4"
      role="alert"
    >
      {{ error }}
    </p>

    <AdminEstablishmentForm
      submit-label="Créer l’établissement"
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
      </template>
    </AdminEstablishmentForm>
  </div>
</template>
