import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Accueil from '../views/Accueil.vue'
import Centers from '../views/Centers.vue'
import CenterDetails from '../views/CenterDetails.vue'
import Contact from '../views/Contact.vue'
import FormPage from '../views/FormPage.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import AdminHome from '../views/admin/AdminHome.vue'

const ADMIN_TOKEN_KEY = 'admin_token'

async function isAdminAuthed() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return false
  try {
    const res = await fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', name: 'home', component: Accueil },
        { path: 'centers', name: 'centers', component: Centers },
        {
          path: 'center/:id',
          name: 'center-details',
          component: CenterDetails,
        },
        { path: 'contact', name: 'contact', component: Contact },
        { path: 'form/:id', name: 'form', component: FormPage },
      ],
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLogin,
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', name: 'admin', component: AdminHome },
      ],
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  if (to.meta?.requiresAdmin) {
    const ok = await isAdminAuthed()
    if (!ok) return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
