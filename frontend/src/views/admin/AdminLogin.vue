<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_TOKEN_KEY } from '@/lib/constants'
import { apiFetch } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()

const username = ref('admin')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const redirectTo = computed(() => {
  const q = route.query.redirect
  return typeof q === 'string' && q.startsWith('/') ? q : '/admin'
})

async function submit() {
  loading.value = true
  error.value = null
  try {
    const res = await apiFetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })
    if (!res.ok) {
      error.value = 'Identifiants invalides.'
      return
    }
    const data = (await res.json()) as { token?: string }
    if (!data.token) {
      error.value = 'Réponse serveur invalide.'
      return
    }
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
    await router.replace(redirectTo.value)
  } catch {
    error.value = 'Impossible de contacter le serveur.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 px-4">
    <div class="w-full max-w-md">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        Espace administrateur
      </h1>
      <p class="text-gray-500 mb-8">
        Connectez‑vous pour accéder à l’administration.
      </p>

      <form
        class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
        @submit.prevent="submit"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Identifiant
          </label>
          <input
            v-model="username"
            autocomplete="username"
            class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            type="text"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            v-model="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            type="password"
            required
          >
        </div>

        <p
          v-if="error"
          class="text-sm text-red-600"
          role="alert"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-teal-700 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>
