<template>
  <div class="app">
    <!-- 左侧菜单栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-area">
        <span class="logo"><MouseIcon/></span>
        <span v-if="!isCollapsed" class="logo-text">小白鼠监测管理系统</span>
      </div>
      
      <nav class="nav-menu">
        <router-link to="/home" class="nav-item" @click="isCollapsed = false">
          <span class="nav-icon"><HomeIcon/></span>
          <span v-if="!isCollapsed" class="nav-text">首页</span>
        </router-link>
        <router-link to="/system" class="nav-item" @click="isCollapsed = false">
          <span class="nav-icon"><SystemManagementIcon/></span>
          <span v-if="!isCollapsed" class="nav-text">系统管理</span>
        </router-link>
        <router-link to="/monitor" class="nav-item" @click="isCollapsed = false">
          <span class="nav-icon"><SystemMonitorIcon/></span>
          <span v-if="!isCollapsed" class="nav-text">系统监控</span>
        </router-link>
        <router-link to="/archives" class="nav-item" @click="isCollapsed = false">
          <span class="nav-icon"><ArchivesManagementIcon/></span>
          <span v-if="!isCollapsed" class="nav-text">档案管理</span>
        </router-link>
        <router-link to="/data" class="nav-item" @click="isCollapsed = false">
          <span class="nav-icon"><DataIcon/></span>
          <span v-if="!isCollapsed" class="nav-text">数据观测</span>
        </router-link>
      </nav>
      
      <!-- 退出登录按钮 -->
      <button class="logout-btn" @click="handleLogout" :title="isCollapsed ? '退出登录' : ''">
        <span class="logout-icon">🚪</span>
        <span v-if="!isCollapsed" class="logout-text">退出登录</span>
      </button>
      
      <!-- 显示侧边栏缩短按钮 -->
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </aside>
    
    <!-- 右侧主内容区 -->
    <main class="main-content">
      <header class="content-header">
       
      </header>
      
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 正确路径
import ArchivesManagementIcon from '../components/icons/IconArchivesManagement.vue'
import SystemManagementIcon from '../components/icons/IconSystemManagement.vue'
import DataIcon from '../components/icons/IconData.vue'
import HomeIcon from '../components/icons/IconHome.vue'
import SystemMonitorIcon from '../components/icons/IconSystemMonitor.vue'
import MouseIcon from '../components/icons/IconMouse.vue'

const route = useRoute()
const router = useRouter()
const isCollapsed = ref(false)
const currentTime = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN')
}

// 退出登录
const handleLogout = () => {
  // 清除登录状态
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('rememberedUser')
  localStorage.removeItem('userInfo')
  
  // 跳转到登录页
  router.push('/login')
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  background: #f1f1f1;
}

/* 左侧菜单栏 */
.sidebar {
  width: 246px;
  background: rgba(34, 43, 50);
  border-right: 1px solid #ccd7ea;
  display: flex;
  flex-direction: column;
  transition: width .3s;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}
/* 折叠侧边栏宽度 */
.sidebar.collapsed {
  width: 64px;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  gap: 12px;
  border-bottom: 1px solid #0dce84;
}

.logo {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
}

.nav-menu {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  line-height: 24px;
  padding: 12px 16px;
  gap: 12px;
  color: #f1f1f1;
  text-decoration: none;
  transition: all 0.2s;
  margin: 4px 8px;
  border-radius: 8px;
}

.nav-item:hover {
  background: #354157;
  color: #fff;
}

.router-link-active {
  background: #354157;
  color: #8eaece;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
}

/* 退出登录按钮样式 */
.logout-btn {
  margin: 8px 16px;
  padding: 8px;
  background: #7e79796f;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background: #cd4545a3;
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 16px;
}

.logout-text {
  font-size: 14px;
}

/* 侧边栏折叠时退出按钮样式 */
.sidebar.collapsed .logout-btn {
  margin: 8px;
  padding: 8px;
}

.sidebar.collapsed .logout-text {
  display: none;
}

.collapse-btn {
  margin: 16px;
  padding: 8px;
  background: #1e293b;
  border: none;
  color: #9ca3af;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #2d3a4e;
  color: #fff;
}

/* 主内容区 */
.main-content {
  flex: 1;
  margin-left: 246px; /* 和侧边栏原始宽度保持一致 */
  transition: margin-left 0.3s;
  background: #f1f1f1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: calc(100% - 246px); /* 明确计算宽度 */
}

.sidebar.collapsed + .main-content {
  margin-left: 64px;
  width: calc(100% - 64px); /* 折叠时同步更新宽度 */
}

/* 内容体 */
.content-body {
  flex: 1; /* 让内容体占满剩余高度 */
  padding: 24px;
  background: #f1f1f1;
  box-sizing: border-box;
  width: 100%;
}
/* 侧边栏折叠时 → 内容自动撑满剩余宽度 */
.sidebar.collapsed ~ .main-content {
  margin-left: 64px;
}
.content-header {
  background: #f1f1f1;
  border-bottom: 1px solid #1e293b;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h2 {
  color: #fff;
  font-size: 20px;
  margin-bottom: 4px;
}

.header-time {
  color: #9ca3af;
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #fff;
  font-size: 14px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #409eff;
}

.content-body {
  flex: 1;
  width: 150vh;
  height: 100%;
  padding: 24px;
  background: #f1f1f1;
  box-sizing: border-box;
}
.content-body > :first-child {
  width: 100%;
  max-width: 100%;
  margin: 0;
}
</style>