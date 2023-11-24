import { createRouter, createWebHistory } from 'vue-router'
import BabylonOne from '@/components/BabylonOne.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BabylonOne
    }
  ]
})

export default router
