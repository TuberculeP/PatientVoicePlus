<template>
    <div class="bg-gray-50 min-h-screen p-8">

        <RouterLink to="/centers"
            class="mb-6 flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100
             focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:bg-yellow-300 focus-visible:text-black">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux centres
        </RouterLink>

        <!-- INFOS CENTRE -->
        <div class="bg-white border border-gray-200 rounded-xl p-8 mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ center.name }}</h1>

            <div class="flex items-center text-gray-600 mb-2">
                <svg class="w-5 h-5 mr-2 text-cyan-700" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                </svg>
                {{ center.cityZip }}
            </div>

            <p class="text-gray-600 mb-4">{{ center.address }}</p>
        </div>

        <!-- SERVICES -->
        <div class="bg-white border border-gray-200 rounded-xl p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Services proposés</h2>

            <div class="flex flex-wrap gap-4">
                <button v-for="specialty in center.specialties" :key="specialty.id" class="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg font-semibold
                focus-visible:outline-yellow-300 focus-visible:outline-4
                focus-visible:bg-yellow-300 focus-visible:text-black">
                    {{ specialty.name }}
                </button>
            </div>
        </div>

        <!-- CARTE -->
        <div class="bg-white border border-gray-200 rounded-xl p-8 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Carte de localisation</h2>

            <div v-if="mapCenter" tabindex="0"
                class="rounded-xl overflow-hidden focus-visible:outline-yellow-300 focus-visible:outline-4 focus-visible:bg-yellow-300"
                style="height: 200px;" aria-describedby="mapDesc">
                <p id="mapDesc" class="sr-only">
                    La carte montre l’emplacement du centre {{ center.name }} à {{ center.address }}, {{ center.cityZip
                    }}.
                </p>

                <l-map :zoom="15" :center="mapCenter" style="height: 100%; width: 100%;"
                    :options="{ keyboard: false, dragging: false, zoomControl: false }">
                    <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors" />
                    <l-marker :lat-lng="mapCenter" />
                </l-map>
            </div>
            <p v-else>Chargement de la carte…</p>
        </div>

        <div class="mb-8">
            <Button :to="`/form/${centerId}`" size="lg" variant="primary" block>
                Accéder au formulaire
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet'
import Button from './components/Button.vue'

const route = useRoute()
const centerId = route.params.id as string

interface Specialty {
    id: number
    name: string
}

const center = ref({
    name: '',
    address: '',
    cityZip: '',
    specialties: [] as Specialty[]
})

const mapCenter = ref<[number, number] | null>(null)

const getCenterFromId = async (id: string) => {
    const response = await fetch(`http://localhost:10000/centers/${id}`)
    return response.json()
}

onMounted(async () => {
    const data = await getCenterFromId(centerId)

    center.value = {
        name: data.name,
        address: data.address,
        cityZip: `${data.postal_code} ${data.city}`,
        specialties: data.specialties
    }

    const address = `${center.value.address}, ${center.value.cityZip}`
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    )
    const geo = await response.json()

    mapCenter.value = geo.length
        ? [parseFloat(geo[0].lat), parseFloat(geo[0].lon)]
        : [48.8566, 2.3522]
})
</script>
