<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Ban, Loader2, RotateCcw } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminFetch } from '../../../composables/useAdminApi'
import type { AdminFormDetail } from '../../../types'

const route = useRoute()

const form = ref<AdminFormDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const actionLoading = ref(false)

const RATING_LABELS: Record<number, string> = {
  1: 'Très insatisfait',
  2: 'Insatisfait',
  3: 'Neutre',
  4: 'Satisfait',
  5: 'Très satisfait',
}

const averageRating = computed(() => {
  if (!form.value) return null
  const ratings = form.value.answers
    .map((a) => parseInt(a.value, 10))
    .filter((n) => n >= 1 && n <= 5)
  if (ratings.length === 0) return null
  return Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

function ratingLabel(value: string) {
  const n = parseInt(value, 10)
  return RATING_LABELS[n] ?? value
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await adminFetch(`/forms/${route.params.id}`)
    if (!res.ok) throw new Error()
    form.value = await res.json()
  } catch {
    error.value = 'Retour introuvable.'
  } finally {
    loading.value = false
  }
}

async function toggleActive() {
  if (!form.value) return
  actionLoading.value = true
  error.value = null
  try {
    const path = form.value.isActive
      ? `/forms/${form.value.id}/deactivate`
      : `/forms/${form.value.id}/activate`
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
      to="/admin/returns"
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
    <div
      v-else-if="error && !form"
      class="text-red-600"
    >
      {{ error }}
    </div>
    <template v-else-if="form">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Détail du retour
          </h1>
          <p class="text-gray-500">
            {{ form.centerName }}
          </p>
          <p class="text-sm text-gray-500 mt-1">
            {{ formatDate(form.createdAt) }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Badge :variant="form.isActive ? 'default' : 'secondary'">
            {{ form.isActive ? 'Actif' : 'Désactivé' }}
          </Badge>
          <Button
            :variant="form.isActive ? 'destructive' : 'outline'"
            :disabled="actionLoading"
            @click="toggleActive"
          >
            <Loader2
              v-if="actionLoading"
              class="h-4 w-4 animate-spin mr-2"
            />
            <Ban
              v-else-if="form.isActive"
              class="h-4 w-4 mr-2"
            />
            <RotateCcw
              v-else
              class="h-4 w-4 mr-2"
            />
            {{ form.isActive ? 'Désactiver' : 'Réactiver' }}
          </Button>
        </div>
      </div>

      <p
        v-if="error"
        class="text-sm text-red-600 mb-4"
        role="alert"
      >
        {{ error }}
      </p>

      <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <p
          v-if="averageRating !== null"
          class="text-sm text-gray-600"
        >
          Note moyenne :
          <span class="font-semibold text-gray-900">{{ averageRating }} / 5</span>
        </p>
        <p class="text-sm text-gray-600 mt-1">
          {{ form.answers.length }} thème(s) renseigné(s)
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-for="answer in form.answers"
          :key="answer.questionId"
          class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
        >
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 class="font-semibold text-gray-800">
              {{ answer.themeName }}
            </h2>
            <span class="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
              {{ answer.value }} / 5 — {{ ratingLabel(answer.value) }}
            </span>
          </div>
          <p
            v-if="answer.content"
            class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
          >
            {{ answer.content }}
          </p>
          <p
            v-else
            class="text-sm text-gray-400 italic"
          >
            Aucun commentaire.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
