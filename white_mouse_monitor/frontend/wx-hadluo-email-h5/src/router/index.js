import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router