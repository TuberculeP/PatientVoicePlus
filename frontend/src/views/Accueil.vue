<template>
    <div class="bg-gray-50 min-h-screen p-8">

        <section class="w-full max-w-2xl mx-auto text-center mb-12 px-4 mt-16">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 break-words">
                L’expérience des patients au cœur de la rééducation
            </h1>
            <p class="text-lg md:text-xl text-gray-500">
                <span class="text-cyan-700">
                    Parce que chaque parcours mérite un retour d’expérience.
                </span>
                PatientVoice permet aux patients de déposer leur témoignage sur leur parcours
                de rééducation fonctionnelle, dans une démarche d’écoute, de compréhension
                et d’amélioration des parcours de soins.
            </p>
        </section>

        <!-- CENTRES -->
        <section class="mb-40">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <CenterCard v-for="center in centers.slice(0, 3)" :key="center.id" :id="center.id" :name="center.name"
                    :address="center.address" :cityZip="center.cityZip" :image="center.image" />
            </div>

            <div class="flex justify-center mt-8">
                <Button to="/centers" size="lg" variant="outline" aria-label="Parcourir tous les centres">
                    Parcourir les centres
                </Button>
            </div>
        </section>

        <!-- POURQUOI -->
        <section class="mb-30">
            <h2 class="text-3xl font-bold text-gray-900 mb-20 text-center">
                Pourquoi nous faire confiance ?
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Card 1 -->
                <div class="bg-white border-2 border-cyan-700/10 rounded-xl p-8 flex flex-col items-center text-center">
                    <div class="bg-cyan-100 rounded-full p-4 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        Vos expériences sont protégées
                    </h3>
                    <p class="text-gray-600">
                        Vos témoignages sont recueillis dans un cadre sécurisé, respectueux
                        et confidentiel.
                    </p>
                </div>

                <!-- Card 2 -->
                <div class="bg-white border-2 border-cyan-700/10 rounded-xl p-8 flex flex-col items-center text-center">
                    <div class="bg-cyan-100 rounded-full p-4 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        Votre voix compte vraiment
                    </h3>
                    <p class="text-gray-600">
                        Chaque avis aide à améliorer la qualité des parcours de rééducation.
                    </p>
                </div>

                <!-- Card 3 -->
                <div class="bg-white border-2 border-cyan-700/10 rounded-xl p-8 flex flex-col items-center text-center">
                    <div class="bg-cyan-100 rounded-full p-4 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">
                        Une démarche transparente et claire
                    </h3>
                    <p class="text-gray-600">
                        Des retours utiles, compréhensibles et accessibles à tous.
                    </p>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './components/Button.vue'
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
    const data = await response.json()

    centers.value = data.map((center: CenterApi) => ({
        id: center.id,
        name: center.name,
        address: center.address,
        cityZip: `${center.postal_code} ${center.city}`,
        image: 'https://picsum.photos/320/140'
    }))
}
onMounted(getCenters)

</script>