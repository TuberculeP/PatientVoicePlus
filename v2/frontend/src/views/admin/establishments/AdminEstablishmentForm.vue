<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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

function toggleSpecialty(id: number) {
  const ids = form.value.specialtyIds
  if (ids.includes(id)) {
    form.value.specialtyIds = ids.filter((x) => x !== id)
  } else {
    form.value.specialtyIds = [...ids, id]
  }
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
      />
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
      />
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
        />
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
        />
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

    <fieldset class="border-0 p-0 m-0">
      <legend class="block text-sm font-medium text-gray-700 mb-2">
        Spécialités
      </legend>
      <p
        v-if="loadingSpecialties"
        class="text-sm text-gray-500"
      >
        Chargement…
      </p>
      <div
        v-else
        class="flex flex-wrap gap-2"
      >
        <label
          v-for="spec in specialties"
          :key="spec.id"
          class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors"
          :class="
            form.specialtyIds.includes(spec.id)
              ? 'border-teal-600 bg-teal-50 text-teal-800'
              : 'border-gray-200 text-gray-700 hover:border-teal-400'
          "
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="form.specialtyIds.includes(spec.id)"
            @change="toggleSpecialty(spec.id)"
          />
          {{ spec.name }}
        </label>
      </div>
    </fieldset>

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
