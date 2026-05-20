<script setup lang="ts">
import { LMap, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Center } from '../types'

const route = useRoute()
const center = ref<Center | null>(null)
const loading = ref(true)
const error = ref(false)
const mapCenter = ref<[number, number]>([46.6034, 1.8883])
const zoom = ref(13)

onMounted(async () => {
  try {
    const res = await fetch(`/api/centers/${route.params.id}`)
    if (!res.ok) throw new Error()
    center.value = await res.json()

    if (center.value) {
      const address = `${center.value.address}, ${center.value.postalCode} ${center.value.city}`
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      ).then((r) => r.json())
      if (geo.length) {
        mapCenter.value = [parseFloat(geo[0].lat), parseFloat(geo[0].lon)]
      }
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
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
      Centre introuvable.
    </div>

    <template v-else-if="center">
      <RouterLink
        to="/centers"
        class="text-sm text-teal-700 hover:underline mb-6 inline-block"
      >
        ← Tous les centres
      </RouterLink>

      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        {{ center.name }}
      </h1>
      <p class="text-gray-500 mb-1">
        {{ center.address }}
      </p>
      <p class="text-gray-500 mb-6">
        {{ center.postalCode }} {{ center.city }}
      </p>

      <p class="text-gray-700 mb-6 leading-relaxed">
        {{ center.description }}
      </p>

      <div
        v-if="center.specialties?.length"
        class="mb-8"
      >
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Spécialités
        </h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="specialty in center.specialties"
            :key="specialty.id"
            class="bg-teal-50 text-teal-700 text-sm px-3 py-1 rounded-full"
          >
            {{ specialty.name }}
          </span>
        </div>
      </div>

      <div class="h-64 rounded-xl overflow-hidden border border-gray-200 mb-8">
        <LMap
          :center="mapCenter"
          :zoom="zoom"
          class="h-full w-full"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <LMarker :lat-lng="mapCenter" />
        </LMap>
      </div>

      <RouterLink
        :to="`/form/${center.id}`"
        class="inline-block bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-800 transition-colors"
      >
        Donner mon avis sur ce centre
      </RouterLink>
    </template>
  </div>
</template>
