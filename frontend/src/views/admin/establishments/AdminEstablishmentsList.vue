<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Ban, Loader2, Pencil, RotateCcw, Trash2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { AdminCenter } from '../../../types'

const centers = ref<AdminCenter[]>([])
const loading = ref(true)
const error = ref(false)
const actionLoading = ref<string | null>(null)

const deleteDialogOpen = ref(false)
const centerToDelete = ref<AdminCenter | null>(null)
const deleteLoading = ref(false)

async function load() {
  loading.value = true
  error.value = false
  try {
    const res = await adminFetch('/centers')
    if (!res.ok) throw new Error()
    centers.value = await res.json()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function toggleActive(center: AdminCenter) {
  actionLoading.value = center.id
  try {
    const path = center.isActive
      ? `/centers/${center.id}/deactivate`
      : `/centers/${center.id}/activate`
    const res = await adminFetch(path, { method: 'PATCH' })
    if (!res.ok) throw new Error()
    await load()
  } catch {
    error.value = true
  } finally {
    actionLoading.value = null
  }
}

function openDeleteDialog(center: AdminCenter) {
  centerToDelete.value = center
  deleteDialogOpen.value = true
}

function closeDeleteDialog() {
  deleteDialogOpen.value = false
  centerToDelete.value = null
}

async function confirmDelete() {
  if (!centerToDelete.value) return
  deleteLoading.value = true
  error.value = false
  try {
    const res = await adminFetch(`/centers/${centerToDelete.value.id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error()
    closeDeleteDialog()
    await load()
  } catch {
    error.value = true
  } finally {
    deleteLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">
          Établissements
        </h1>
        <p class="text-gray-500">
          Gérez les centres visibles sur le site public.
        </p>
      </div>
      <RouterLink
        to="/admin/establishments/new"
        :class="cn(buttonVariants({ size: 'lg' }))"
      >
        Nouvel établissement
      </RouterLink>
    </div>

    <div
      v-if="loading"
      class="text-gray-500"
    >
      Chargement…
    </div>
    <div
      v-else-if="error && centers.length === 0"
      class="text-red-600"
    >
      Impossible de charger les établissements.
    </div>
    <div
      v-else-if="centers.length === 0"
      class="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm"
    >
      Aucun établissement pour le moment.
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
            <TableHead>Nom</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Code postal</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead class="text-right w-[130px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="center in centers"
            :key="center.id"
            :class="{ 'opacity-60': !center.isActive }"
          >
            <TableCell class="font-medium text-gray-900">
              {{ center.name }}
            </TableCell>
            <TableCell class="max-w-[200px] truncate">
              {{ center.address }}
            </TableCell>
            <TableCell>
              {{ center.city }}
            </TableCell>
            <TableCell>
              {{ center.postalCode }}
            </TableCell>
            <TableCell>
              <Badge :variant="center.isActive ? 'default' : 'secondary'">
                {{ center.isActive ? 'Actif' : 'Désactivé' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <RouterLink
                  :to="`/admin/establishments/${center.id}/edit`"
                  :class="cn(buttonVariants({ variant: 'outline', size: 'icon' }))"
                  aria-label="Modifier l’établissement"
                  title="Modifier"
                >
                  <Pencil class="h-4 w-4" />
                </RouterLink>
                <Button
                  :variant="center.isActive ? 'destructive' : 'outline'"
                  size="icon"
                  :disabled="actionLoading === center.id"
                  :aria-label="
                    center.isActive
                      ? 'Désactiver l’établissement'
                      : 'Réactiver l’établissement'
                  "
                  :title="center.isActive ? 'Désactiver' : 'Réactiver'"
                  @click="toggleActive(center)"
                >
                  <Loader2
                    v-if="actionLoading === center.id"
                    class="h-4 w-4 animate-spin"
                  />
                  <Ban
                    v-else-if="center.isActive"
                    class="h-4 w-4"
                  />
                  <RotateCcw
                    v-else
                    class="h-4 w-4"
                  />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  :disabled="deleteLoading && centerToDelete?.id === center.id"
                  aria-label="Supprimer définitivement l’établissement"
                  title="Supprimer"
                  @click="openDeleteDialog(center)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Supprimer définitivement ?
          </DialogTitle>
          <DialogDescription>
            <template v-if="centerToDelete">
              L’établissement <strong class="text-gray-800">{{ centerToDelete.name }}</strong>
              sera supprimé de la base de données. Cette action est irréversible
              (formulaires et avis associés inclus).
            </template>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            :disabled="deleteLoading"
            @click="closeDeleteDialog"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            :disabled="deleteLoading"
            @click="confirmDelete"
          >
            {{ deleteLoading ? 'Suppression…' : 'Supprimer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
