import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginLayout from '@/layouts/Login.vue'
import LoginView from '@/views/LoginView.vue'

import HomeView from '@/views/HomeView.vue'

// 系统管理
import SystemView from '@/views/SystemView.vue'
import UserView from '@/views/UserView.vue'
import PermissionView from '@/views/PermissionView.vue'
import TransactionLogView from '@/views/TransactionLogView.vue'

// 监控管理
import MonitorView from '@/views/MonitorView.vue'
import MonitorStatusView from '@/views/Live_monitor.vue'
import MonitorReplayView from '@/views/MonitorReplayView.vue'
import MonitorLogsView from '@/views/MonitorLogsView.vue'
import MonitorAlertsView from '@/views/MonitorAlertsView.vue'

// 档案管理
//  分类管理
import ArchivesView from '@/views/ArchivesView.vue'
import ArchivesList from '@/views/ArchivesList.vue'
import ArchivesAdd from '@/views/ArchivesAdd.vue'
import ArchivesSearch from '@/views/ArchivesSearch.vue'

// 数据管理
// 实时数据 历史数据 数据报表
import RealTimeData from '@/views/RealTimeData.vue'
import HistoricalData from '@/views/HistoricalData.vue'
import DataReport from '@/views/DataReport.vue'

// AI分析
// 预测分析 异常检测 智能洞察
// import PredictAnalysis from '@/views/PredictAnalysis.vue'
// import ExceptionDetection from '@/views/ExceptionDetection.vue'
// import SmartInsight from '@/views/SmartInsight.vue'


import DataView from '@/views/DataView.vue'
import DataViewTotal from '@/views/DataViewTotal.vue'
import AIView from '@/views/AIanalysisView.vue'
import RegisterView from '@/views/RegisterView.vue'

// 个人中心
import ProfileView from '@/components/Profile.vue'
import NotificationsView from '@/components/Notifications.vue'



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
      { path: '', redirect: '/login', component: LoginView },
      { path: 'home', name: '首页', component: HomeView },

      /* <router-link to="/system/user" class="submenu-item" @click="closeSubmenu">用户管理</router-link>
                      <router-link to="/monitor/role" class="submenu-item" @click="closeSubmenu">角色管理</router-link>
                      <router-link to="/system/permission" class="submenu-item" @click="closeSubmenu">操作日志</router-link> */

      // 系统管理
      { path: '/system/user', name: 'user', component: UserView },
      { path: '/system/permission', name: 'permission', component: PermissionView },
      { path: '/system/TransactionLog', name: 'TransactionLog', component: TransactionLogView },
      // { path: 'system', name: '系统', component: SystemView },
      // { path: 'monitor', name: '监控', component: MonitorView },



      // <router-link to="/monitor/status" class="submenu-item" @click="closeSubmenu">实时直播</router-link>
      // <router-link to="/monitor/logs" class="submenu-item" @click="closeSubmenu">日志监控</router-link>
      // <router-link to="/monitor/alerts" class="submenu-item" @click="closeSubmenu">告警记录</router-link>

      // 系统监控
      { path: '/monitor/status', name: 'monitor_status', component: MonitorStatusView },
      { path: '/monitor/replay', name: 'monitor_replay', component: MonitorReplayView },
      { path: '/monitor/logs', name: 'monitor_logs', component: MonitorLogsView },
      { path: '/monitor/alerts', name: 'monitor_alerts', component: MonitorAlertsView },

      // 档案管理
      { path: 'archives', name: '档案', component: ArchivesView },
      { path: 'archives/list', name: '档案列表', component: ArchivesList },
      { path: 'archives/add', name: '档案档案', component: ArchivesAdd },
      { path: 'archives/search', name: '档案搜索', component: ArchivesSearch },

      // 数据管理
      // 实时数据 历史数据 数据报表
      { path: 'data/real-time', name: '实时数据', component: RealTimeData },
      { path: 'data/history', name: '历史数据', component: HistoricalData },
      { path: 'data/report', name: '数据报表', component: DataReport },

      // AI分析
      // 预测分析 异常检测 智能洞察
      // { path: 'ai/predict', name: '预测分析', component: PredictAnalysis },
      // { path: 'ai/detect', name: '异常检测', component: ExceptionDetection },
      // { path: 'ai/insight', name: '智能洞察', component: SmartInsight },
      // { path: 'profile', name: '个人资料', component: ProfileView },
      // { path: 'password', name: '修改密码', component: PasswordView },
      {
        path: 'data',
        name: 'data',
        components: {
          default: DataView,        // 默认视图，对应未命名的 router-view
          totalView: DataViewTotal  // 命名视图，对应 name="totalView" 的 router-view
        }
      },
      { path: 'ai', name: 'ai', component: AIView },
      { path: 'profile', name: 'profile', component: ProfileView },
      { path: 'profile/notifications', name: 'notifications', component: NotificationsView }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router