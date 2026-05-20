<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Ban, Loader2, RotateCcw, BrainCircuit } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { adminFetch } from '../../../composables/useAdminApi'
import type { AdminCenter, AdminFormListItem, AnalysisStatus } from '../../../types'

const ANALYSIS_BADGE: Record<AnalysisStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Analyse…', variant: 'secondary' },
  DONE: { label: 'Analysé', variant: 'default' },
  ERROR: { label: 'Erreur IA', variant: 'destructive' },
}

const router = useRouter()

const forms = ref<AdminFormListItem[]>([])
const centers = ref<AdminCenter[]>([])
const selectedCenterId = ref('')
const loading = ref(true)
const error = ref(false)
const actionLoading = ref<string | null>(null)

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

async function loadCenters() {
  const res = await adminFetch('/centers')
  if (res.ok) centers.value = await res.json()
}

async function loadForms() {
  loading.value = true
  error.value = false
  try {
    const query = selectedCenterId.value
      ? `?centerId=${encodeURIComponent(selectedCenterId.value)}`
      : ''
    const res = await adminFetch(`/forms${query}`)
    if (!res.ok) throw new Error()
    forms.value = await res.json()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function goToDetail(id: string) {
  void router.push(`/admin/returns/${id}`)
}

async function toggleActive(form: AdminFormListItem) {
  actionLoading.value = form.id
  try {
    const path = form.isActive
      ? `/forms/${form.id}/deactivate`
      : `/forms/${form.id}/activate`
    const res = await adminFetch(path, { method: 'PATCH' })
    if (!res.ok) throw new Error()
    await loadForms()
  } catch {
    error.value = true
  } finally {
    actionLoading.value = null
  }
}

watch(selectedCenterId, loadForms)

onMounted(async () => {
  await loadCenters()
  await loadForms()
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">
        Retours
      </h1>
      <p class="text-gray-500">
        Consultation des avis patients. Les retours désactivés ne sont plus visibles sur le site public.
      </p>
    </div>

    <div class="mb-6 max-w-md">
      <label
        for="center-filter"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Filtrer par établissement
      </label>
      <select
        id="center-filter"
        v-model="selectedCenterId"
        class="w-full rounded-lg border border-gray-200 pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
      >
        <option value="">
          Tous les établissements
        </option>
        <option
          v-for="center in centers"
          :key="center.id"
          :value="center.id"
        >
          {{ center.name }}
        </option>
      </select>
    </div>

    <div
      v-if="loading"
      class="text-gray-500"
    >
      Chargement…
    </div>
    <div
      v-else-if="error && forms.length === 0"
      class="text-red-600"
    >
      Impossible de charger les retours.
    </div>
    <div
      v-else-if="forms.length === 0"
      class="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm"
    >
      Aucun retour pour ce filtre.
    </div>
    <div
      v-else
      class="rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <p
        v-if="error"
        class="px-4 py-2 text-sm text-red-600 border-b border-gray-100"
        role="alert"
      >
        Une erreur est survenue lors de la dernière action.
      </p>
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent border-gray-200 bg-gray-50/80">
            <TableHead>Date</TableHead>
            <TableHead>Établissement</TableHead>
            <TableHead>Note moyenne</TableHead>
            <TableHead>Réponses</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>
              <span class="flex items-center gap-1">
                <BrainCircuit class="h-3.5 w-3.5" />
                Analyse IA
              </span>
            </TableHead>
            <TableHead class="text-right w-[100px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="form in forms"
            :key="form.id"
            class="cursor-pointer"
            :class="{ 'opacity-60': !form.isActive }"
            @click="goToDetail(form.id)"
          >
            <TableCell class="text-gray-700 whitespace-nowrap">
              {{ formatDate(form.createdAt) }}
            </TableCell>
            <TableCell class="font-medium text-gray-900">
              {{ form.centerName }}
            </TableCell>
            <TableCell>
              <span v-if="form.averageRating !== null">
                {{ form.averageRating }} / 5
              </span>
              <span
                v-else
                class="text-gray-400"
              >—</span>
            </TableCell>
            <TableCell>
              {{ form.answersCount }}
            </TableCell>
            <TableCell>
              <Badge :variant="form.isActive ? 'default' : 'secondary'">
                {{ form.isActive ? 'Actif' : 'Désactivé' }}
              </Badge>
            </TableCell>
            <TableCell>
              <span v-if="form.analysisStatus">
                <Badge
                  :variant="ANALYSIS_BADGE[form.analysisStatus].variant"
                  class="flex items-center gap-1 w-fit"
                >
                  <Loader2
                    v-if="form.analysisStatus === 'PENDING'"
                    class="h-3 w-3 animate-spin"
                  />
                  {{ ANALYSIS_BADGE[form.analysisStatus].label }}
                </Badge>
              </span>
              <span
                v-else
                class="text-gray-400 text-sm"
              >—</span>
            </TableCell>
            <TableCell
              class="text-right"
              @click.stop
            >
              <div class="flex justify-end gap-1">
                <RouterLink
                  :to="`/admin/returns/${form.id}`"
                  :class="cn(buttonVariants({ variant: 'outline', size: 'icon' }))"
                  aria-label="Voir le détail du retour"
                  title="Voir le détail"
                >
                  <ArrowRight class="h-4 w-4" />
                </RouterLink>
                <Button
                  :variant="form.isActive ? 'destructive' : 'outline'"
                  size="icon"
                  :disabled="actionLoading === form.id"
                  :aria-label="
                    form.isActive
                      ? 'Désactiver le retour'
                      : 'Réactiver le retour'
                  "
                  :title="form.isActive ? 'Désactiver' : 'Réactiver'"
                  @click.stop="toggleActive(form)"
                >
                  <Loader2
                    v-if="actionLoading === form.id"
                    class="h-4 w-4 animate-spin"
                  />
                  <Ban
                    v-else-if="form.isActive"
                    class="h-4 w-4"
                  />
                  <RotateCcw
                    v-else
                    class="h-4 w-4"
                  />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
