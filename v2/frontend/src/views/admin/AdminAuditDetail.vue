<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

const ADMIN_TOKEN_KEY = 'admin_token'

type AuditStatus = 'DRAFT' | 'SENT' | 'DONE'

type Audit = {
  id: string
  title: string
  content: string
  status: AuditStatus
  createdAt: string
  center: { name: string; city: string }
}

const route = useRoute()
const router = useRouter()

const audit = ref<Audit | null>(null)
const loading = ref(true)
const saving = ref(false)
const savedAt = ref<string | null>(null)

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY)}` }
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown,
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'audit-editor min-h-[400px] focus:outline-none px-1',
    },
  },
})

async function fetchAudit() {
  loading.value = true
  try {
    const res = await fetch(`/api/admin/audits/${route.params.id}`, {
      headers: authHeader(),
    })
    if (!res.ok) {
      await router.replace({ name: 'admin-audits' })
      return
    }
    audit.value = await res.json()
    editor.value?.commands.setContent(audit.value!.content)
  } finally {
    loading.value = false
  }
}

async function saveContent() {
  if (!editor.value || !audit.value) return
  saving.value = true
  try {
    const content = editor.value.storage.markdown.getMarkdown()
    await fetch(`/api/admin/audits/${audit.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ content }),
    })
    savedAt.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } finally {
    saving.value = false
  }
}

async function setStatus(status: AuditStatus) {
  if (!audit.value || audit.value.status === status) return
  const res = await fetch(`/api/admin/audits/${audit.value.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ status }),
  })
  if (res.ok) {
    const updated: Audit = await res.json()
    audit.value = { ...audit.value, status: updated.status }
  }
}

const STATUS_LABEL: Record<AuditStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  DONE: 'Traité',
}

const STATUS_CLASS: Record<AuditStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
  SENT: 'bg-blue-100 text-blue-700 border-blue-200',
  DONE: 'bg-green-100 text-green-700 border-green-200',
}

const STATUS_ACTIVE_CLASS: Record<AuditStatus, string> = {
  DRAFT: 'ring-2 ring-gray-400',
  SENT: 'ring-2 ring-blue-500',
  DONE: 'ring-2 ring-green-500',
}

onMounted(fetchAudit)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <RouterLink
        :to="{ name: 'admin-audits' }"
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700 transition-colors mb-4"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour aux audits
      </RouterLink>

      <div
        v-if="audit"
        class="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            {{ audit.title }}
          </h1>
          <p class="text-gray-500 text-sm mt-0.5">
            {{ audit.center.name }} — {{ audit.center.city }}
          </p>
        </div>
        <button
          type="button"
          :disabled="saving"
          class="bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 text-sm"
          @click="saveContent"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>

      <p
        v-if="savedAt"
        class="text-xs text-gray-400 mt-1"
      >
        Enregistré à {{ savedAt }}
      </p>
    </div>

    <div
      v-if="loading"
      class="text-gray-400 text-sm"
    >
      Chargement…
    </div>

    <div
      v-else-if="audit"
      class="space-y-6"
    >
      <!-- Sélecteur de statut -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 mr-1">Statut :</span>
        <button
          v-for="s in (['DRAFT', 'SENT', 'DONE'] as AuditStatus[])"
          :key="s"
          type="button"
          class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-all"
          :class="[STATUS_CLASS[s], audit.status === s ? STATUS_ACTIVE_CLASS[s] : 'opacity-60 hover:opacity-100']"
          @click="setStatus(s)"
        >
          {{ STATUS_LABEL[s] }}
        </button>
      </div>

      <!-- Éditeur tiptap -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <EditorContent
          :editor="editor"
          class="p-6"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.audit-editor) {
  color: #1f2937;
  line-height: 1.75;
  font-size: 0.9375rem;
}
:deep(.audit-editor h1) { font-size: 1.5rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
:deep(.audit-editor h2) { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.375rem; }
:deep(.audit-editor h3) { font-size: 1.1rem; font-weight: 600; margin: 0.875rem 0 0.25rem; }
:deep(.audit-editor p) { margin: 0.5rem 0; }
:deep(.audit-editor ul) { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.audit-editor ol) { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
:deep(.audit-editor li) { margin: 0.25rem 0; }
:deep(.audit-editor strong) { font-weight: 600; }
:deep(.audit-editor em) { font-style: italic; color: #6b7280; }
:deep(.audit-editor code) { background: #f3f4f6; border-radius: 0.25rem; padding: 0.125rem 0.375rem; font-size: 0.875em; }
:deep(.audit-editor blockquote) { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #6b7280; margin: 0.75rem 0; }
:deep(.audit-editor hr) { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
</style>
