<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
      <p>© {{ new Date().getFullYear() }} PatientVoice — Voix aux patients</p>
      <nav class="flex gap-6">
        <RouterLink to="/" class="hover:text-teal-700 transition-colors">Accueil</RouterLink>
        <RouterLink to="/centers" class="hover:text-teal-700 transition-colors">
          Les centres
        </RouterLink>
        <RouterLink to="/contact" class="hover:text-teal-700 transition-colors">Contact</RouterLink>
      </nav>
    </div>
  </footer>
</template>
