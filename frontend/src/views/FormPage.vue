<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const showRecap = ref(false)

/** questionId → { note 1–5, commentaire libre } */
const answers = ref<Record<string, { value: string; content: string }>>({})

/** noms de thèmes dont le panneau est ouvert */
const openThemes = ref<Set<string>>(new Set())

const RATING_LABELS: Record<number, string> = {
  1: 'Très insatisfait',
  2: 'Insatisfait',
  3: 'Neutre',
  4: 'Satisfait',
  5: 'Très satisfait',
}

function getAnswer(questionId: string) {
  if (!answers.value[questionId]) {
    answers.value[questionId] = { value: '', content: '' }
  }
  return answers.value[questionId]
}

/** Recliquer sur la note active la retire */
function toggleRating(questionId: string, n: number) {
  const answer = getAnswer(questionId)
  const key = String(n)
  answer.value = answer.value === key ? '' : key
}

function isRatingSelected(questionId: string, n: number) {
  return getAnswer(questionId).value === String(n)
}

function toggleTheme(themeName: string) {
  const next = new Set(openThemes.value)
  if (next.has(themeName)) {
    next.delete(themeName)
  } else {
    next.add(themeName)
  }
  openThemes.value = next
}

function isOpen(themeName: string) {
  return openThemes.value.has(themeName)
}

function panelId(themeName: string) {
  return `theme-panel-${themeName.replace(/\s+/g, '-').toLowerCase()}`
}

function headerId(themeName: string) {
  return `theme-header-${themeName.replace(/\s+/g, '-').toLowerCase()}`
}

const NO_RATING_VALUE = '0'

function isThemeAnswered(theme: Theme) {
  const a = getAnswer(theme.questionId)
  if (theme.commentOnly) return a.content.trim() !== ''
  return a.value !== ''
}

const answeredCount = computed(() =>
  themes.value.filter((t) => isThemeAnswered(t)).length,
)

type RecapItem = {
  themeName: string
  commentOnly: boolean
  ratingValue?: string
  ratingLabel?: string
  comment?: string
}

const recapItems = computed((): RecapItem[] =>
  themes.value
    .filter((t) => isThemeAnswered(t))
    .map((theme) => {
      const a = getAnswer(theme.questionId)
      const n = parseInt(a.value, 10)
      return {
        themeName: theme.name,
        commentOnly: !!theme.commentOnly,
        ratingValue: theme.commentOnly ? undefined : a.value,
        ratingLabel:
          !theme.commentOnly && n >= 1 && n <= 5
            ? `${a.value} — ${RATING_LABELS[n]}`
            : undefined,
        comment: a.content.trim() || undefined,
      }
    }),
)

function buildPayload() {
  return themes.value
    .map((theme) => {
      const a = getAnswer(theme.questionId)
      if (theme.commentOnly) {
        if (!a.content.trim()) return null
        return {
          question_id: parseInt(theme.questionId, 10),
          value: NO_RATING_VALUE,
          content: a.content.trim(),
        }
      }
      if (a.value === '') return null
      return {
        question_id: parseInt(theme.questionId, 10),
        value: a.value,
        content: a.content.trim() || undefined,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
}

function openRecap() {
  if (answeredCount.value === 0) return
  showRecap.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function backToEdit() {
  showRecap.value = false
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
  const payload = buildPayload()
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
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
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
      Une erreur est survenue.
    </div>

    <div
      v-else-if="submitted"
      class="text-center py-16"
    >
      <p
        class="text-5xl mb-4"
        aria-hidden="true"
      >
        ✓
      </p>
      <h2 class="text-2xl font-bold text-teal-700 mb-2">
        Merci pour votre avis !
      </h2>
      <p class="text-gray-500">
        Redirection en cours…
      </p>
    </div>

    <template v-else>
      <RouterLink
        :to="`/center/${route.params.id}`"
        class="text-sm text-teal-700 hover:underline mb-6 inline-block"
      >
        ← Retour au centre
      </RouterLink>

      <!-- Récapitulatif avant envoi définitif -->
      <div v-if="showRecap">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Vérifiez votre avis
        </h1>
        <p
          v-if="center"
          class="text-gray-500 mb-2"
        >
          {{ center.name }}
        </p>
        <p class="text-sm text-gray-600 mb-6">
          Relisez le résumé ci-dessous. Si tout est correct, confirmez l’envoi. Sinon,
          modifiez vos réponses.
        </p>

        <ul class="space-y-4 mb-8">
          <li
            v-for="item in recapItems"
            :key="item.themeName"
            class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            <h2 class="font-semibold text-gray-900 mb-2">
              {{ item.themeName }}
            </h2>
            <p
              v-if="item.ratingLabel"
              class="text-sm text-teal-800 font-medium mb-2"
            >
              Note : {{ item.ratingLabel }}
            </p>
            <p
              v-if="item.comment"
              class="text-sm text-gray-700 whitespace-pre-wrap break-words"
            >
              <span
                v-if="!item.commentOnly"
                class="font-medium text-gray-600"
              >Commentaire : </span>{{ item.comment }}
            </p>
            <p
              v-else-if="!item.commentOnly"
              class="text-sm text-gray-400 italic"
            >
              Aucun commentaire
            </p>
          </li>
        </ul>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            class="flex-1 border border-gray-300 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            :disabled="submitting"
            @click="backToEdit"
          >
            Modifier mon avis
          </button>
          <button
            type="button"
            class="flex-1 bg-teal-700 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? 'Envoi…' : 'Confirmer et envoyer' }}
          </button>
        </div>
      </div>

      <!-- Formulaire -->
      <div v-else>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Votre avis
        </h1>
        <p
          v-if="center"
          class="text-gray-500 mb-2"
        >
          {{ center.name }}
        </p>
        <p class="text-sm text-gray-600 mb-8">
          Ouvrez chaque thème pour noter de 1 à 5 et, si vous le souhaitez, laisser un
          commentaire. La section « Autre aspect » permet de partager librement tout autre
          sujet, sans note. Vous pouvez ne répondre qu’aux thèmes qui vous concernent.
        </p>

        <form
          class="space-y-3"
          @submit.prevent="openRecap"
        >
          <div
            v-for="theme in themes"
            :key="theme.name"
            class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
          >
            <h2 class="m-0">
              <button
                :id="headerId(theme.name)"
                type="button"
                class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset"
                :aria-expanded="isOpen(theme.name)"
                :aria-controls="panelId(theme.name)"
                @click="toggleTheme(theme.name)"
              >
                <span>{{ theme.name }}</span>
                <span
                  class="shrink-0 text-teal-700 transition-transform duration-200"
                  :class="{ 'rotate-180': isOpen(theme.name) }"
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>
            </h2>

            <div
              v-show="isOpen(theme.name)"
              :id="panelId(theme.name)"
              role="region"
              :aria-labelledby="headerId(theme.name)"
              class="px-5 pb-5 pt-1 border-t border-gray-100"
            >
              <template v-if="theme.commentOnly">
                <p class="text-sm text-gray-600 mb-4">
                  Décrivez ici tout autre aspect de votre séjour qui n’a pas été couvert
                  ci-dessus.
                </p>
                <label
                  :for="`comment-${theme.questionId}`"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Votre commentaire
                </label>
                <textarea
                  :id="`comment-${theme.questionId}`"
                  v-model="getAnswer(theme.questionId).content"
                  rows="5"
                  maxlength="4000"
                  placeholder="Ex. activités, visites, équipements, suggestions…"
                  class="textarea-comment w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-y min-h-[8rem]"
                />
              </template>

              <template v-else>
                <fieldset class="border-0 p-0 m-0">
                  <legend class="sr-only">
                    Note pour {{ theme.name }}
                  </legend>
                  <p class="text-sm text-gray-600 mb-3">
                    De 1 (très insatisfait) à 5 (très satisfait)
                  </p>
                  <div
                    class="flex flex-wrap gap-2 mb-5"
                    role="radiogroup"
                    :aria-label="`Note pour ${theme.name}`"
                  >
                    <button
                      v-for="n in [1, 2, 3, 4, 5]"
                      :key="n"
                      type="button"
                      role="radio"
                      :aria-checked="isRatingSelected(theme.questionId, n)"
                      class="flex-1 min-w-[4.5rem] flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-3 text-center text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                      :class="
                        isRatingSelected(theme.questionId, n)
                          ? 'border-teal-700 bg-teal-50 text-teal-900'
                          : 'border-gray-200 text-gray-800 hover:border-teal-400'
                      "
                      @click="toggleRating(theme.questionId, n)"
                    >
                      <span class="text-lg font-bold">{{ n }}</span>
                      <span class="text-xs text-gray-600 leading-tight">{{
                        RATING_LABELS[n]
                      }}</span>
                    </button>
                  </div>
                </fieldset>

                <label
                  :for="`comment-${theme.questionId}`"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Votre avis en quelques mots (facultatif)
                </label>
                <textarea
                  :id="`comment-${theme.questionId}`"
                  v-model="getAnswer(theme.questionId).content"
                  rows="4"
                  maxlength="4000"
                  placeholder="Partagez librement votre expérience sur ce thème…"
                  class="textarea-comment w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-y min-h-[6rem]"
                />
              </template>
            </div>
          </div>

          <p class="text-sm text-gray-500 pt-2">
            {{ answeredCount }} thème(s) renseigné(s) sur {{ themes.length }}
          </p>

          <button
            type="submit"
            :disabled="answeredCount === 0"
            class="w-full bg-teal-700 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Voir le récapitulatif
          </button>
        </form>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Firefox */
.textarea-comment {
  scrollbar-width: thin;
  scrollbar-color: #0d9488 #f3f4f6;
}

/* Chromium, Safari, Edge */
.textarea-comment::-webkit-scrollbar {
  width: 10px;
}

.textarea-comment::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 0 0.5rem 0.5rem 0;
}

.textarea-comment::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 9999px;
  border: 2px solid #f3f4f6;
}

.textarea-comment::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #0d9488 0%, #0f766e 100%);
}

.textarea-comment::-webkit-scrollbar-thumb:active {
  background: #0f766e;
}

.textarea-comment::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
