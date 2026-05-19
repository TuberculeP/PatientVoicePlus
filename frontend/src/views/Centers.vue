<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="mb-10 text-center">
      <h2 class="text-4xl font-bold text-gray-900 mb-4" aria-label="Parcourir les centres">
        Parcourir les centres
      </h2>
      <p class="text-xl text-gray-500">
        Et faire entendre votre voix..
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <CenterCard
        v-for="center in centers"
        :key="center.id"
        :id="center.id"
        :name="center.name"
        :address="center.address"
        :cityZip="center.cityZip"
        :image="center.image"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CenterCard from './components/CenterCard.vue'

interface CenterApi {
  id: string
  name: string
  address: string
  city: string
  postal_code: string
}

interface Center {
  id: string
  name: string
  address: string
  cityZip: string
  image: string
}

const centers = ref<Center[]>([])

const getCenters = async () => {
  const response = await fetch('http://localhost:10000/centers')
  const data: CenterApi[] = await response.json()

  centers.value = data.map(center => ({
    id: center.id,
    name: center.name,
    address: center.address,
    cityZip: `${center.postal_code} ${center.city}`,
    image: 'https://picsum.photos/320/140'
  }))
}

onMounted(getCenters)
</script>
