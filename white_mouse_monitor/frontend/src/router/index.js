import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginLayout from '@/layouts/Login.vue'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import SystemView from '@/views/SystemView.vue'
import MonitorView from '@/views/MonitorView.vue'
import ArchivesView from '@/views/ArchivesView.vue'
import DataView from '@/views/DataView.vue'
import RegisterView from '@/views/RegisterView.vue'

const checkAuth = (to, from, next) => {
  const token = localStorage.getItem('token')
  if (token) {
    next()// 已登录，放行
  } else {
    next('/login')// 未登录，跳转到登录页
  }
}

const routes = [
  // 登陆路由
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: LoginView
      }
    ]
  },
  // 注册路由
  {
    path: '/register',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'register',
        component: RegisterView
      }
    ]
  },
  // 主页路由
  {
    path: '/',
    component: MainLayout,
    beforeEnter: checkAuth,
    children: [
      { path: 'home', name: '首页', component: HomeView },
      { path: 'system', name: 'system', component: SystemView },
      { path: 'monitor', name: 'monitor', component: MonitorView },
      { path: 'archives', name: 'archives', component: ArchivesView },
      { path: 'data', name: 'data', component: DataView },
      { path: '', redirect: '/login', component: LoginView }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router