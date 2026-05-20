<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const ADMIN_TOKEN_KEY = 'admin_token'

const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)

const navItems = [
  { to: '/admin', label: 'Tableau de bord', exact: true },
  { to: '/admin/audits', label: 'Audits' },
  { to: '/admin/establishments', label: 'Établissements', exact: false },
  { to: '/admin/returns', label: 'Retours', exact: false },
]

function isNavActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

async function logout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  await router.replace({ name: 'admin-login' })
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <!-- Barre mobile -->
  <div
    class="md:hidden print:hidden fixed inset-x-0 top-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between"
  >
    <RouterLink
      to="/admin"
      class="text-teal-700 font-bold text-lg tracking-tight"
      @click="closeMenu"
    >
      PatientVoice Admin
    </RouterLink>
    <button
      type="button"
      class="p-2 rounded text-gray-500 hover:text-teal-700"
      :aria-expanded="menuOpen"
      aria-label="Menu administration"
      @click="menuOpen = !menuOpen"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          v-if="!menuOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path
          v-else
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="menuOpen"
      class="md:hidden fixed inset-0 z-30 bg-black/30"
      aria-hidden="true"
      @click="closeMenu"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="h-full shrink-0 w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen z-40 print:hidden
           fixed inset-y-0 left-0 transform transition-transform duration-200 md:static md:translate-x-0"
    :class="menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    aria-label="Navigation administration"
  >
    <div class="px-5 py-6 border-b border-gray-100">
      <RouterLink
        to="/admin"
        class="block text-teal-700 font-bold text-xl tracking-tight"
        @click="closeMenu"
      >
        PatientVoice
      </RouterLink>
      <p class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10">
        Administration
      </p>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          isNavActive(item)
            ? 'text-teal-700 bg-teal-50'
            : 'text-gray-600 hover:text-teal-700 hover:bg-gray-50'
        "
        @click="closeMenu"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="px-3 py-4 border-t border-gray-100 space-y-1">
      <RouterLink
        to="/"
        class="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-gray-50 transition-colors"
        @click="closeMenu"
      >
        Retour au site
      </RouterLink>
      <button
        type="button"
        class="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-teal-700 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset"
        @click="logout"
      >
        Se déconnecter
      </button>
    </div>
  </aside>
</template>
