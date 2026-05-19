import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/Accueil.vue') },
    { path: '/centers', name: 'centers', component: () => import('../views/Centers.vue') },
    {
      path: '/center/:id',
      name: 'center-details',
      component: () => import('../views/CenterDetails.vue'),
    },
    { path: '/contact', name: 'contact', component: () => import('../views/Contact.vue') },
    { path: '/form/:id', name: 'form', component: () => import('../views/FormPage.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
