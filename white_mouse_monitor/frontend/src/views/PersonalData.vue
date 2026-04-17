<template>
  <div class="account-setting-page">
    <div class="container">
      <!-- 顶部 -->
      <div class="header">
        <div class="page-title">账号设置</div>
        <div class="search">
          <span>🔍</span>
          <input type="text" placeholder="搜索设置项" v-model="searchKey" />
        </div>
      </div>

      <!-- 内容 -->
      <div class="content">
        <!-- 左侧菜单 -->
        <div class="setting-menu">
          <div class="menu-title">设置</div>
          <ul class="menu-list">
            <li
              v-for="item in menuList"
              :key="item.name"
              :class="{ active: activeMenu === item.name }"
              @click="activeMenu = item.name"
            >
              {{ item.name }}
            </li>
          </ul>
        </div>

        <!-- 右侧内容 -->
        <div class="setting-content">
          <div class="section-title">账号管理</div>

          <div class="item">
            <div class="label">头像</div>
            <div class="value">
              <div class="avatar-mini">文</div>
            </div>
          </div>

          <div class="item">
            <div class="label">昵称</div>
            <div class="value">
              文君
              <span class="arrow">›</span>
            </div>
          </div>

          <!-- 所属角色 -->
          <div class="item">
            <div class="label">所属角色</div>
            <div class="value">
              {{ userRole }}
              <span class="arrow">›</span>
            </div>
          </div>

          <div class="item">
            <div class="label">手机号</div>
            <div class="value">
              197 3056 2422
              <span class="arrow">›</span>
            </div>
          </div>

          <div class="item">
            <div class="label">所属单位</div>
            <div class="value">
              已绑定
              <span class="arrow">›</span>
            </div>
          </div>

          <div class="item">
            <div class="label">修改密码</div>
            <div class="value">
              <span class="arrow">›</span>
            </div>
          </div>

          <div class="item">
            <div class="label">账号注销</div>
            <div class="value">
              <span class="arrow">›</span>
            </div>
          </div>

          <div class="logout">
            <button @click="handleLogout">退出登录</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 搜索框
const searchKey = ref('')

// 左侧菜单
const menuList = ref([
  { name: '账号管理' },
  { name: '安全设置' },
  { name: '消息通知' },
  { name: '隐私设置' },
  { name: '设备管理' },
  { name: '关于系统' },
])
const activeMenu = ref('账号管理')

// 用户角色：管理员 / 实验参与成员 / 审计员
const userRole = ref('管理员')

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    console.log('退出成功')
    // 这里可写跳转逻辑
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
}

.account-setting-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  /* padding: 20px; */
}

.container {
  width: 100%;
  max-width: 800px;
  background:  transparent;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.search {
  width: 280px;
  height: 38px;
  background: #f8fafc;
  border-radius: 19px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  color: #94a3b8;
}

.search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #334155;
  width: 100%;
}

.content {
  display: flex;
  /* padding: 32px; */
  gap: 32px;
}

.setting-menu {
  width: 180px;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.menu-list {
  list-style: none;
}

.menu-list li {
  padding: 11px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #475569;
  margin-bottom: 4px;
}

.menu-list li:hover {
  background: #f1f5f9;
}

.menu-list li.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.setting-content {
  flex: 1;
  background: #fafbfc;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}
.item:last-child {
  border-bottom: none;
}

.label {
  font-size: 15px;
  color: #334155;
  font-weight: 500;
}

.value {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 14px;
}

.avatar-mini {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  position: relative;
}

.avatar-mini::after {
  content: '2';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #ef4444;
  border-radius: 50%;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.arrow {
  color: #94a3b8;
  font-size: 16px;
}

.logout {
  margin-top: 40px;
  text-align: center;
}

.logout button {
  padding: 11px 32px;
  border-radius: 10px;
  border: none;
  background: white;
  color: #ef4444;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.1);
  transition: all 0.25s ease;
}

.logout button:hover {
  background: #fef2f2;
  transform: translateY(-1px);
}
</style>