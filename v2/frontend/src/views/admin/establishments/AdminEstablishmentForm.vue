<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { CenterFormData, Specialty } from '../../../types'
import { adminFetch } from '../../../composables/useAdminApi'

const props = defineProps<{
  initial?: CenterFormData
  submitLabel: string
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: CenterFormData]
}>()

const specialties = ref<Specialty[]>([])
const loadingSpecialties = ref(true)
const specialtyToAdd = ref<number | ''>('')

const form = ref<CenterFormData>({
  name: '',
  description: '',
  city: '',
  postalCode: '',
  address: '',
  specialtyIds: [],
})

watch(
  () => props.initial,
  (value) => {
    if (value) form.value = { ...value }
  },
  { immediate: true },
)

onMounted(async () => {
  try {
    const res = await adminFetch('/specialties')
    if (res.ok) specialties.value = await res.json()
  } finally {
    loadingSpecialties.value = false
  }
})

const availableSpecialties = computed(() =>
  specialties.value.filter((s) => !form.value.specialtyIds.includes(s.id)),
)

function specialtyName(id: number) {
  return specialties.value.find((s) => s.id === id)?.name ?? ''
}

function addSpecialty() {
  if (specialtyToAdd.value === '') return
  const id = Number(specialtyToAdd.value)
  if (!form.value.specialtyIds.includes(id)) {
    form.value.specialtyIds = [...form.value.specialtyIds, id]
  }
  specialtyToAdd.value = ''
}

function removeSpecialty(id: number) {
  form.value.specialtyIds = form.value.specialtyIds.filter((x) => x !== id)
}

function onSubmit() {
  emit('submit', { ...form.value })
}
</script>

<template>
  <form
    class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5"
    @submit.prevent="onSubmit"
  >
    <div>
      <label
        for="name"
        class="block text-sm font-medium text-gray-700 mb-1"
      >Nom</label>
      <input
        id="name"
        v-model="form.name"
        required
        class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        type="text"
      >
    </div>

    <div>
      <label
        for="address"
        class="block text-sm font-medium text-gray-700 mb-1"
      >Adresse</label>
      <input
        id="address"
        v-model="form.address"
        required
        class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        type="text"
      >
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label
          for="postalCode"
          class="block text-sm font-medium text-gray-700 mb-1"
        >Code postal</label>
        <input
          id="postalCode"
          v-model="form.postalCode"
          required
          class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          type="text"
        >
      </div>
      <div>
        <label
          for="city"
          class="block text-sm font-medium text-gray-700 mb-1"
        >Ville</label>
        <input
          id="city"
          v-model="form.city"
          required
          class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          type="text"
        >
      </div>
    </div>

    <div>
      <label
        for="description"
        class="block text-sm font-medium text-gray-700 mb-1"
      >Description</label>
      <textarea
        id="description"
        v-model="form.description"
        required
        rows="4"
        class="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-y"
      />
    </div>

    <div>
      <label
        for="specialty-select"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Spécialités
      </label>
      <p
        v-if="loadingSpecialties"
        class="text-sm text-gray-500"
      >
        Chargement…
      </p>
      <template v-else>
        <select
          id="specialty-select"
          v-model="specialtyToAdd"
          :disabled="availableSpecialties.length === 0"
          class="w-full rounded-lg border border-gray-200 pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
          @change="addSpecialty"
        >
          <option value="">
            {{ availableSpecialties.length === 0 ? 'Toutes les spécialités sont sélectionnées' : 'Choisir une spécialité…' }}
          </option>
          <option
            v-for="spec in availableSpecialties"
            :key="spec.id"
            :value="spec.id"
          >
            {{ spec.name }}
          </option>
        </select>
        <ul
          v-if="form.specialtyIds.length"
          class="mt-2 flex flex-wrap gap-2"
        >
          <li
            v-for="id in form.specialtyIds"
            :key="id"
            class="inline-flex items-center gap-1.5 rounded-lg border border-teal-600 bg-teal-50 px-3 py-1.5 text-sm text-teal-800"
          >
            {{ specialtyName(id) }}
            <button
              type="button"
              class="text-teal-600 hover:text-teal-900 font-semibold leading-none"
              :aria-label="`Retirer ${specialtyName(id)}`"
              @click="removeSpecialty(id)"
            >
              ×
            </button>
          </li>
        </ul>
      </template>
    </div>

    <div class="flex flex-wrap gap-3 pt-2">
      <button
        type="submit"
        :disabled="loading"
        class="bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
      >
        {{ loading ? 'Enregistrement…' : submitLabel }}
      </button>
      <slot name="actions" />
    </div>
  </form>
</template>
