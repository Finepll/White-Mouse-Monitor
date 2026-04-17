<template>
  <div class="app">
    <!-- 左侧菜单栏 - 永远固定在左侧 -->
    <div class="sidebar-container">
      <div class="sidebar" :class="{ collapsed: isCollapsed }">
        <div class="logo-area">
          <span class="logo"><MouseIcon/></span>
          <span v-if="!isCollapsed" class="logo-text">小白鼠监测管理系统</span>
        </div>
        
        <nav class="nav-menu">
          <!-- 首页：没有子菜单，直接跳转 -->
          <router-link to="/home" class="nav-item" @click="isCollapsed = false">
            <span class="nav-icon"><HomeIcon/></span>
            <span v-if="!isCollapsed" class="nav-text">首页</span>
          </router-link>
          
          <!-- 系统管理：带子菜单 -->
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ 'has-submenu': true, 'expanded': isMenuExpanded('system') }"
              @click="toggleSubmenu('system')"
            >
              <span class="nav-icon"><SystemManagementIcon/></span>
              <span v-if="!isCollapsed" class="nav-text">系统管理</span>
              <span v-if="!isCollapsed" class="submenu-arrow" :class="{ rotated: isMenuExpanded('system') }">▼</span>
            </div>
            <transition name="submenu-slide">
              <div v-if="!isCollapsed && isMenuExpanded('system')" class="submenu">
                <router-link to="/system/user" class="submenu-item" @click="closeSubmenu">用户管理</router-link>
                <router-link to="/system/permission" class="submenu-item" @click="closeSubmenu">权限设置</router-link>
                <router-link to="/system/TransactionLog" class="submenu-item" @click="closeSubmenu">操作日志</router-link>
              </div>
            </transition>
          </div>
          
          <!-- 系统监控：带子菜单 -->
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ 'has-submenu': true, 'expanded': isMenuExpanded('monitor') }"
              @click="toggleSubmenu('monitor')"
            >
              <span class="nav-icon"><SystemMonitorIcon/></span>
              <span v-if="!isCollapsed" class="nav-text">系统监控</span>
              <span v-if="!isCollapsed" class="submenu-arrow" :class="{ rotated: isMenuExpanded('monitor') }">▼</span>
            </div>
            <transition name="submenu-slide">
              <div v-if="!isCollapsed && isMenuExpanded('monitor')" class="submenu">
                <router-link to="/monitor/status" class="submenu-item" @click="closeSubmenu">实时直播</router-link>
                <router-link to="/monitor/replay" class="submenu-item" @click="closeSubmenu">监控回放</router-link>
                <router-link to="/monitor/logs" class="submenu-item" @click="closeSubmenu">日志监控</router-link>
                <router-link to="/monitor/alerts" class="submenu-item" @click="closeSubmenu">告警记录</router-link>
              </div>
            </transition>
          </div>
          
          <!-- 档案管理：带子菜单 -->
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ 'has-submenu': true, 'expanded': isMenuExpanded('archives') }"
              @click="toggleSubmenu('archives')"
            >
              <span class="nav-icon"><ArchivesManagementIcon/></span>
              <span v-if="!isCollapsed" class="nav-text">档案管理</span>
              <span v-if="!isCollapsed" class="submenu-arrow" :class="{ rotated: isMenuExpanded('archives') }">▼</span>
            </div>
            <transition name="submenu-slide">
              <div v-if="!isCollapsed && isMenuExpanded('archives')" class="submenu">
                <router-link to="/archives/list" class="submenu-item" @click="closeSubmenu">档案列表</router-link>
                <router-link to="/archives/add" class="submenu-item" @click="closeSubmenu">分类管理</router-link>
                <router-link to="/archives/search" class="submenu-item" @click="closeSubmenu">高级搜索</router-link>
              </div>
            </transition>
          </div>
          
          <!-- 数据观测：带子菜单 -->
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ 'has-submenu': true, 'expanded': isMenuExpanded('data') }"
              @click="toggleSubmenu('data')"
            >
              <span class="nav-icon"><DataIcon/></span>
              <span v-if="!isCollapsed" class="nav-text">数据观测</span>
              <span v-if="!isCollapsed" class="submenu-arrow" :class="{ rotated: isMenuExpanded('data') }">▼</span>
            </div>
            <transition name="submenu-slide">
              <div v-if="!isCollapsed && isMenuExpanded('data')" class="submenu">
                <router-link to="/data/real-time" class="submenu-item" @click="closeSubmenu">实时数据</router-link>
                <router-link to="/data/history" class="submenu-item" @click="closeSubmenu">历史数据</router-link>
                <router-link to="/data/report" class="submenu-item" @click="closeSubmenu">数据报表</router-link>
              </div>
            </transition>
          </div>
          
          <!-- AI分析：带子菜单 -->
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ 'has-submenu': true, 'expanded': isMenuExpanded('ai') }"
              @click="toggleSubmenu('ai')"
            >
              <span class="nav-icon"><IconAI/></span>
              <span v-if="!isCollapsed" class="nav-text">AI分析</span>
              <span v-if="!isCollapsed" class="submenu-arrow" :class="{ rotated: isMenuExpanded('ai') }">▼</span>
            </div>
            <transition name="submenu-slide">
              <div v-if="!isCollapsed && isMenuExpanded('ai')" class="submenu">
                <router-link to="/ai/predict" class="submenu-item" @click="closeSubmenu">预测分析</router-link>
                <router-link to="/ai/anomaly" class="submenu-item" @click="closeSubmenu">异常检测</router-link>
                <router-link to="/ai/insights" class="submenu-item" @click="closeSubmenu">智能洞察</router-link>
              </div>
            </transition>
          </div>
          
          <!-- 个人中心：带子菜单 -->
          <div class="nav-item-wrapper">
            <div 
              class="nav-item" 
              :class="{ 'has-submenu': true, 'expanded': isMenuExpanded('personal') }"
              @click="toggleSubmenu('personal')"
            >
              <span class="nav-icon"><PersonalDataIcon/></span>
              <span v-if="!isCollapsed" class="nav-text">个人中心</span>
              <span v-if="!isCollapsed" class="submenu-arrow" :class="{ rotated: isMenuExpanded('personal') }">▼</span>
            </div>
            <transition name="submenu-slide">
              <div v-if="!isCollapsed && isMenuExpanded('personal')" class="submenu">
                <router-link to="/profile" class="submenu-item" @click="closeSubmenu">个人资料</router-link>
                <router-link to="/profile/notifications" class="submenu-item" @click="closeSubmenu">消息通知</router-link>
              </div>
            </transition>
          </div>
        </nav>
        
        <!-- 退出登录按钮 -->
        <button class="logout-btn" @click="handleLogout" :title="isCollapsed ? '退出登录' : ''">
          <span class="logout-icon">🚪</span>
          <span v-if="!isCollapsed" class="logout-text">退出登录</span>
        </button>
        
        <!-- 显示侧边栏缩短按钮 -->
        <button class="collapse-btn" @click="toggleSidebar">
          {{ isCollapsed ? '→' : '←' }}
        </button>
      </div>
    </div>

    <!-- 右侧主内容区 - 自适应剩余空间 -->
    <div class="main-content-container">
      <main class="main-content">
        <header class="content-header">
          <!-- 可添加头部内容 -->
        </header>
        
        <div class="content-body">
          <!-- 默认路由视图 -->
          <router-view />
          
          <!-- 命名路由视图：只在 data 路由时显示 -->
          <router-view name="totalView" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import ArchivesManagementIcon from '../components/icons/IconArchivesManagement.vue'
import SystemManagementIcon from '../components/icons/IconSystemManagement.vue'
import DataIcon from '../components/icons/IconData.vue'
import HomeIcon from '../components/icons/IconHome.vue'
import SystemMonitorIcon from '../components/icons/IconSystemMonitor.vue'
import MouseIcon from '../components/icons/IconMouse.vue'
import IconAI from '../components/icons/IconAI.vue'
import PersonalDataIcon from '../components/icons/IconPersonalData.vue'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)
// ✅ 改为数组，存储所有展开的菜单
const expandedMenus = ref([]) // 存储所有展开的菜单名称

// ✅ 判断菜单是否展开
const isMenuExpanded = (menuName) => {
  return expandedMenus.value.includes(menuName)
}

// ✅ 切换子菜单展开/收起（支持多个同时展开，再次点击同一菜单才收起）
const toggleSubmenu = (menuName) => {
  const index = expandedMenus.value.indexOf(menuName)
  if (index === -1) {
    // 不存在则添加（展开）
    expandedMenus.value.push(menuName)
  } else {
    // 存在则删除（收起）
    expandedMenus.value.splice(index, 1)
  }
}

// 关闭所有子菜单（点击子菜单项后）
const closeSubmenu = () => {
  expandedMenus.value = []
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // 折叠时自动收起所有子菜单
  if (isCollapsed.value) {
    expandedMenus.value = []
  }
}

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('rememberedUser')
  localStorage.removeItem('userInfo')
  router.push('/login')
}

// ✅ 监听路由变化，自动展开对应的父菜单（保留已展开的，添加新的）
watch(() => route.path, (newPath) => {
  // 根据当前路径自动展开对应的父菜单（不关闭其他已展开的）
  if (newPath.startsWith('/system') && !expandedMenus.value.includes('system')) {
    expandedMenus.value.push('system')
  } else if (newPath.startsWith('/monitor') && !expandedMenus.value.includes('monitor')) {
    expandedMenus.value.push('monitor')
  } else if (newPath.startsWith('/archives') && !expandedMenus.value.includes('archives')) {
    expandedMenus.value.push('archives')
  } else if (newPath.startsWith('/data') && !expandedMenus.value.includes('data')) {
    expandedMenus.value.push('data')
  } else if (newPath.startsWith('/ai') && !expandedMenus.value.includes('ai')) {
    expandedMenus.value.push('ai')
  } else if (newPath.startsWith('/profile') && !expandedMenus.value.includes('personal')) {
    expandedMenus.value.push('personal')
  }
}, { immediate: true })
</script>

<style scoped>
/* Grid 布局：占据整个视窗，左侧固定，右侧自适应 */
.app {
  display: grid;
  grid-template-columns: auto 1fr;   /* 左侧宽度自适应内容，右侧占满剩余空间 */
  grid-template-rows: 1fr;           /* 单行占满整个高度 */
  height: 100vh;                     /* 占据整个视窗高度 */
  width: 100vw;                      /* 占据整个视窗宽度 */
  overflow: hidden;                  /* 防止整体滚动，内部各自管理滚动 */
  background: #f1f1f1;
  position: fixed;                   /* 固定在视窗，确保不会滚动 */
  top: 0;
  left: 0;
}

/* 左侧菜单栏容器 - 永远固定在左侧 */
.sidebar-container {
  display: flex;
  width: 100%;                      /* 占满父容器高度 */
  grid-column: 1;                    /* 明确指定在第一列 */
  grid-row: 1;                       /* 明确指定在第一行 */
  overflow-y: auto;
      &::-webkit-scrollbar {
        display: none;
      }
}

/* 侧边栏本身 - 固定宽度 */
.sidebar {
  width: 246px;
  background: rgba(34, 43, 50);
  border-right: 1px solid #0c42a0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

/* 折叠状态 */
.sidebar.collapsed {
  width: 64px;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  gap: 12px;
  border-bottom: 1px solid #0dce84;
  flex-shrink: 0;
}

.logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;  
}
/* 菜单项包装器，用于容纳主菜单和子菜单 */
.nav-item-wrapper {
  display: flex;
  flex-direction: column;
}

/* 主菜单项样式 - 支持带子菜单的样式 */
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
  white-space: nowrap;
  cursor: pointer;
}

/* 带子菜单的菜单项 */
.nav-item.has-submenu {
  cursor: pointer;
}

.nav-item.has-submenu:hover {
  background: #354157;
  color: #fff;
}

/* 展开状态的菜单项背景 */
.nav-item.has-submenu.expanded {
  background: #354157;
  color: #8eaece;
}

.nav-item:hover {
  background: #354157;
  color: #fff;
}

/* router-link 激活状态保持原有高亮 */
.router-link-active {
  background: #354157;
  color: #8eaece;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  flex: 1;
}

/* 子菜单箭头 */
.submenu-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
  margin-left: auto;
  flex-shrink: 0;
}

.submenu-arrow.rotated {
  transform: rotate(-180deg);
}

/* 子菜单容器 */
.submenu {
  margin-left: 32px;  /* 缩进对齐图标位置 */
  padding-left: 8px;
  border-left: 1px solid #0dce84;
  margin-top: 4px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 子菜单项样式 */
.submenu-item {
  display: block;
  padding: 8px 12px;
  color: #b0bec5;
  text-decoration: none;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.submenu-item:hover {
  background: #2d3a4e;
  color: #fff;
}

/* 子菜单激活状态 */
.router-link-active.submenu-item {
  background: #2d3a4e;
  color: #8eaece;
}

/* 子菜单展开/收起动画 */
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.submenu-slide-enter-from,
.submenu-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.submenu-slide-enter-to,
.submenu-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
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
  flex-shrink: 0;
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
/* 折叠按钮 */
.collapse-btn {
  margin: 16px;
  padding: 8px;
  background: #1e293b;
  border: none;
  color: #9ca3af;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #2d3a4e;
  color: #fff;
}

/* 右侧主内容区容器 - 占满剩余空间，永远在右侧 */
.main-content-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  grid-column: 2;                    /* 明确指定在第二列 */
  grid-row: 1;                       /* 明确指定在第一行 */
  min-width: 0;                      /* 防止内容溢出，允许收缩 */
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f1f1f1;
  overflow: hidden;
  width: 100%;
  min-width: 0;                      /* 防止内容溢出 */
}

.content-header {
  background: #f1f1f1;
  border-bottom: 1px solid #1e293b;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.content-body {
  flex: 1;
  background: #f1f1f1;
  overflow-y: auto;                  /* 内容区域内部滚动，不影响整体布局 */
  overflow-x: auto;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;                      /* 防止内容溢出 */
}

/* 确保 router-view 内容自适应宽度 */
.content-body > :first-child {
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* 美化滚动条 */
.content-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.content-body::-webkit-scrollbar-track {
  background: #e0e0e0;
  border-radius: 4px;
}

.content-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.content-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 侧边栏滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: #2a3744;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #4a5a6e;
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #5a6a7e;
}
</style>