<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Center, Theme } from '../types'

const route = useRoute()
const router = useRouter()

const center = ref<Center | null>(null)
const themes = ref<Theme[]>([])
const loading = ref(true)
const error = ref(false)
const submitting = ref(false)
const submitted = ref(false)

const answers = ref<Record<string, { value: string; content: string }>>({})

function getAnswer(questionId: string) {
  if (!answers.value[questionId]) {
    answers.value[questionId] = { value: '', content: '' }
  }
  return answers.value[questionId]
}

onMounted(async () => {
  try {
    const [centerRes, formsRes] = await Promise.all([
      fetch(`/api/centers/${route.params.id}`),
      fetch('/api/forms'),
    ])
    if (!centerRes.ok || !formsRes.ok) throw new Error()
    center.value = await centerRes.json()
    themes.value = await formsRes.json()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

async function submit() {
  const payload = Object.entries(answers.value)
    .filter(([, a]) => a.value !== '')
    .map(([question_id, a]) => ({
      question_id: parseInt(question_id),
      value: a.value,
      content: a.content || undefined,
    }))

  if (payload.length === 0) return

  submitting.value = true
  try {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ center_id: route.params.id, answers: payload }),
    })
    if (!res.ok) throw new Error()
    submitted.value = true
    setTimeout(() => router.push(`/center/${route.params.id}`), 2000)
  } catch {
    error.value = true
  } finally {
    submitting.value = false
  }
}

function hasAnyAnswer() {
  return Object.values(answers.value).some((a) => a.value !== '')
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <div v-if="loading" class="text-gray-500">Chargement…</div>
    <div v-else-if="error" class="text-red-600">Une erreur est survenue.</div>

    <div v-else-if="submitted" class="text-center py-16">
      <p class="text-5xl mb-4">✓</p>
      <h2 class="text-2xl font-bold text-teal-700 mb-2">Merci pour votre avis !</h2>
      <p class="text-gray-500">Redirection en cours…</p>
    </div>

    <template v-else>
      <RouterLink
        :to="`/center/${route.params.id}`"
        class="text-sm text-teal-700 hover:underline mb-6 inline-block"
      >
        ← Retour au centre
      </RouterLink>

      <h1 class="text-3xl font-bold text-gray-800 mb-2">Votre avis</h1>
      <p v-if="center" class="text-gray-500 mb-8">{{ center.name }}</p>

      <form @submit.prevent="submit" class="space-y-10">
        <fieldset v-for="theme in themes" :key="theme.name">
          <legend
            class="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 w-full"
          >
            {{ theme.name }}
          </legend>

          <div v-for="question in theme.questions" :key="question.id" class="mb-6">
            <p class="text-gray-700 mb-3 font-medium">{{ question.name }}</p>

            <div class="flex gap-6 mb-3">
              <label
                v-for="n in [1, 2, 3, 4, 5]"
                :key="n"
                class="flex flex-col items-center gap-1 cursor-pointer"
              >
                <input
                  type="radio"
                  :name="`q-${question.id}`"
                  :value="String(n)"
                  v-model="getAnswer(question.id).value"
                  class="accent-teal-700 w-4 h-4"
                />
                <span class="text-xs text-gray-500">{{ n }}</span>
              </label>
            </div>

            <textarea
              v-if="answers[question.id]?.value"
              v-model="answers[question.id]!.content"
              placeholder="Commentaire (optionnel)"
              maxlength="255"
              rows="2"
              class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 resize-none"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          :disabled="submitting || !hasAnyAnswer()"
          class="w-full bg-teal-700 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Envoi…' : 'Envoyer mon avis' }}
        </button>
      </form>
    </template>
  </div>
</template>
