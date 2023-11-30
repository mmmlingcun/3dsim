import { createRouter, createWebHistory } from 'vue-router'
import BabylonOne from '@/components/BabylonOne.vue'
import JiaMi from '@/components/JiaMi.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BabylonOne
    },{
      path:'/jiami',
      name:'jiami',
      component:JiaMi
    }
  ]
})

export default router
