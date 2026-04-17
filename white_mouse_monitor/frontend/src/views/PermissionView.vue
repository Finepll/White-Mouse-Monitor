<template>
  <div class="permission-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>🔐 权限设置</h1>
        <div class="sub">基于角色的访问控制 · 管理不同角色的功能权限</div>
      </div>
      <button class="btn-save-all" @click="saveAllPermissions">
        <span class="save-icon">💾</span> 保存所有更改
      </button>
    </div>

    <!-- 角色概览卡片 -->
    <div class="roles-overview">
      <div class="role-card" v-for="role in roles" :key="role.value" :class="role.class">
        <div class="role-icon">{{ role.icon }}</div>
        <div class="role-info">
          <div class="role-name">{{ role.label }}</div>
          <div class="role-desc">{{ role.desc }}</div>
        </div>
        <div class="role-stats">
          <span class="perm-count">{{ getPermissionCount(role.value) }} 项权限</span>
        </div>
      </div>
    </div>

    <!-- 权限表格 -->
    <div class="permission-table-wrapper">
      <div class="table-header">
        <div class="perm-col perm-module">功能模块</div>
        <div class="perm-col perm-action">权限操作</div>
        <div class="perm-col perm-role" v-for="role in roles" :key="role.value">
          <div class="role-header" :class="role.class">
            {{ role.label }}
          </div>
        </div>
      </div>

      <div class="table-body">
        <div v-for="module in permissionModules" :key="module.key" class="module-group">
          <div class="module-title">
            <span class="module-icon">{{ module.icon }}</span>
            <span>{{ module.name }}</span>
          </div>
          <div v-for="perm in module.permissions" :key="perm.key" class="permission-row">
            <div class="perm-col perm-module">
              <span class="perm-name">{{ perm.name }}</span>
              <span class="perm-desc">{{ perm.desc }}</span>
            </div>
            <div class="perm-col perm-action">
              <span class="action-badge">{{ perm.action }}</span>
            </div>
            <div class="perm-col perm-role" v-for="role in roles" :key="role.value">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  v-model="permissionsData[role.value][perm.key]"
                  :disabled="isPermissionDisabled(role.value, perm.key)"
                  class="permission-checkbox"
                />
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限说明卡片 -->
    <div class="info-card">
      <div class="info-header">
        <span class="info-icon">ℹ️</span>
        <span class="info-title">权限说明</span>
      </div>
      <div class="info-content">
        <div class="info-item">
          <span class="badge-admin">管理员</span>
          <span>拥有系统所有功能的完整权限，可管理用户、配置系统、查看全部数据。</span>
        </div>
        <div class="info-item">
          <span class="badge-auditor">审计员</span>
          <span>可查看所有档案和日志，但无法修改数据，支持导出审计报告。</span>
        </div>
        <div class="info-item">
          <span class="badge-experimenter">实验人员</span>
          <span>可管理自己的实验记录、查看小鼠档案，无法访问系统配置和审计日志。</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <button class="btn-reset" @click="resetPermissions">
        <span class="reset-icon">⟳</span> 重置
      </button>
      <button class="btn-save" @click="saveAllPermissions">
        💾 保存更改
      </button>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="showToast" class="toast-message">
      ✓ 权限设置已保存
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 角色定义
const roles = [
  { value: 'experimenter', label: '实验人员', icon: '🔬', desc: '实验操作与数据记录', class: 'role-experimenter' },
  { value: 'auditor', label: '审计员', icon: '📋', desc: '数据审计与合规检查', class: 'role-auditor' },
  { value: 'admin', label: '管理员', icon: '⚙️', desc: '系统配置与用户管理', class: 'role-admin' }
]

// 权限模块定义
const permissionModules = [
  {
    key: 'dashboard',
    name: '工作台',
    icon: '📊',
    permissions: [
      { key: 'dashboard_view', name: '查看工作台', desc: '访问首页仪表盘', action: '查看' },
      { key: 'dashboard_stats', name: '查看统计', desc: '查看系统统计数据', action: '查看' }
    ]
  },
  {
    key: 'archives',
    name: '档案管理',
    icon: '📁',
    permissions: [
      { key: 'archives_view', name: '查看档案', desc: '浏览小鼠档案列表', action: '查看' },
      { key: 'archives_create', name: '新建档案', desc: '添加新的小鼠档案', action: '创建' },
      { key: 'archives_edit', name: '编辑档案', desc: '修改档案信息', action: '编辑' },
      { key: 'archives_delete', name: '删除档案', desc: '删除档案记录', action: '删除' },
      { key: 'archives_export', name: '导出档案', desc: '导出档案数据', action: '导出' }
    ]
  },
  {
    key: 'data',
    name: '数据观测',
    icon: '📈',
    permissions: [
      { key: 'data_view', name: '查看数据', desc: '查看实验数据', action: '查看' },
      { key: 'data_export', name: '导出数据', desc: '导出观测数据', action: '导出' },
      { key: 'data_analyze', name: '数据分析', desc: '使用分析工具', action: '分析' }
    ]
  },
  {
    key: 'ai',
    name: 'AI分析',
    icon: '🤖',
    permissions: [
      { key: 'ai_view', name: '查看分析', desc: '查看AI分析结果', action: '查看' },
      { key: 'ai_predict', name: '预测分析', desc: '使用预测模型', action: '预测' },
      { key: 'ai_export', name: '导出报告', desc: '导出分析报告', action: '导出' }
    ]
  },
  {
    key: 'system',
    name: '系统管理',
    icon: '⚙️',
    permissions: [
      { key: 'system_user', name: '用户管理', desc: '管理用户账户', action: '管理' },
      { key: 'system_permission', name: '权限设置', desc: '配置角色权限', action: '配置' },
      { key: 'system_log', name: '操作日志', desc: '查看系统日志', action: '查看' }
    ]
  },
  {
    key: 'monitor',
    name: '系统监控',
    icon: '📡',
    permissions: [
      { key: 'monitor_status', name: '服务状态', desc: '查看服务运行状态', action: '查看' },
      { key: 'monitor_alert', name: '告警管理', desc: '管理告警规则', action: '管理' }
    ]
  }
]

// 默认权限配置（基于角色的预设）
const defaultPermissions = {
  experimenter: {
    // 工作台
    dashboard_view: true,
    dashboard_stats: true,
    // 档案管理
    archives_view: true,
    archives_create: true,
    archives_edit: true,
    archives_delete: false,
    archives_export: true,
    // 数据观测
    data_view: true,
    data_export: true,
    data_analyze: true,
    // AI分析
    ai_view: true,
    ai_predict: true,
    ai_export: true,
    // 系统管理
    system_user: false,
    system_permission: false,
    system_log: false,
    // 系统监控
    monitor_status: false,
    monitor_alert: false
  },
  auditor: {
    dashboard_view: true,
    dashboard_stats: true,
    archives_view: true,
    archives_create: false,
    archives_edit: false,
    archives_delete: false,
    archives_export: true,
    data_view: true,
    data_export: true,
    data_analyze: false,
    ai_view: true,
    ai_predict: false,
    ai_export: true,
    system_user: false,
    system_permission: false,
    system_log: true,
    monitor_status: true,
    monitor_alert: false
  },
  admin: {
    dashboard_view: true,
    dashboard_stats: true,
    archives_view: true,
    archives_create: true,
    archives_edit: true,
    archives_delete: true,
    archives_export: true,
    data_view: true,
    data_export: true,
    data_analyze: true,
    ai_view: true,
    ai_predict: true,
    ai_export: true,
    system_user: true,
    system_permission: true,
    system_log: true,
    monitor_status: true,
    monitor_alert: true
  }
}

// 权限数据（响应式）
const permissionsData = reactive({
  experimenter: { ...defaultPermissions.experimenter },
  auditor: { ...defaultPermissions.auditor },
  admin: { ...defaultPermissions.admin }
})

// 保存原始数据的备份
const originalPermissions = ref(JSON.parse(JSON.stringify(permissionsData)))

// Toast 提示
const showToast = ref(false)

// 计算每个角色的权限数量
const getPermissionCount = (role) => {
  const perms = permissionsData[role]
  return Object.values(perms).filter(v => v === true).length
}

// 判断权限是否禁用（某些核心权限不可修改）
const isPermissionDisabled = (role, permKey) => {
  // 管理员的某些核心权限不可禁用
  if (role === 'admin') {
    const protectedPerms = ['system_user', 'system_permission', 'system_log']
    if (protectedPerms.includes(permKey)) {
      return true
    }
  }
  return false
}

// 保存所有权限
const saveAllPermissions = () => {
  originalPermissions.value = JSON.parse(JSON.stringify(permissionsData))
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
  console.log('权限已保存:', permissionsData)
}

// 重置权限
const resetPermissions = () => {
  permissionsData.experimenter = { ...originalPermissions.value.experimenter }
  permissionsData.auditor = { ...originalPermissions.value.auditor }
  permissionsData.admin = { ...originalPermissions.value.admin }
}

// 获取所有权限键列表（用于调试）
const getAllPermissionKeys = () => {
  const keys = []
  permissionModules.forEach(module => {
    module.permissions.forEach(perm => {
      keys.push(perm.key)
    })
  })
  return keys
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.permission-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #f5f7fb;
  min-height: 100%;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-left h1 {
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2c3e4e, #1a4d3e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.sub {
  color: #5b6e8c;
  font-size: 0.9rem;
  margin-top: 0.3rem;
  border-left: 3px solid #2c9a6e;
  padding-left: 0.75rem;
}

.btn-save-all {
  background: #1f5e4a;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-save-all:hover {
  background: #164b3b;
  transform: translateY(-1px);
}

/* 角色概览卡片 */
.roles-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.role-card {
  background: white;
  border-radius: 1rem;
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #edf2f7;
  transition: all 0.2s;
}

.role-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.role-experimenter .role-icon {
  background: #e0f2e9;
}
.role-auditor .role-icon {
  background: #fff0e0;
}
.role-admin .role-icon {
  background: #ffe8e6;
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.role-desc {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.perm-count {
  font-size: 0.7rem;
  color: #1f5e4a;
  background: #e0f2e9;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

/* 权限表格 */
.permission-table-wrapper {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.table-header,
.permission-row {
  display: flex;
  min-width: 700px;
}

.table-header {
  background: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  font-size: 0.85rem;
}

.perm-col {
  padding: 1rem;
}

.perm-module {
  width: 220px;
  flex-shrink: 0;
}

.perm-action {
  width: 100px;
  flex-shrink: 0;
}

.perm-role {
  width: 100px;
  flex-shrink: 0;
  text-align: center;
}

.role-header {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  display: inline-block;
}

.role-header.role-experimenter {
  background: #e0f2e9;
  color: #1f7840;
}
.role-header.role-auditor {
  background: #fff0e0;
  color: #c26b2e;
}
.role-header.role-admin {
  background: #ffe8e6;
  color: #bc4e2c;
}

/* 模块组 */
.module-group {
  border-bottom: 1px solid #f0f3f9;
}

.module-group:last-child {
  border-bottom: none;
}

.module-title {
  padding: 0.8rem 1rem;
  background: #fafcff;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c4b3e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #eef2f8;
}

.module-icon {
  font-size: 1rem;
}

.permission-row {
  border-bottom: 1px solid #f0f3f9;
  transition: background 0.2s;
}

.permission-row:hover {
  background: #fafefb;
}

.permission-row:last-child {
  border-bottom: none;
}

.perm-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
}

.perm-desc {
  display: block;
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.action-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  background: #f1f5f9;
  border-radius: 20px;
  color: #5e7a93;
}

/* 自定义复选框 */
.checkbox-container {
  display: inline-block;
  position: relative;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #2c9a6e;
}

.checkbox-container input:checked ~ .checkmark {
  background: #2c9a6e;
  border-color: #2c9a6e;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-container input:disabled ~ .checkmark {
  background: #f1f5f9;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

.checkbox-container input:disabled:checked ~ .checkmark {
  background: #a0c4b3;
  border-color: #a0c4b3;
}

/* 说明卡片 */
.info-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #edf2f7;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eef2f6;
}

.info-icon {
  font-size: 1rem;
}

.info-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c4b3e;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
}

.badge-admin,
.badge-auditor,
.badge-experimenter {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge-admin {
  background: #ffe8e6;
  color: #bc4e2c;
}

.badge-auditor {
  background: #fff0e0;
  color: #c26b2e;
}

.badge-experimenter {
  background: #e0f2e9;
  color: #1f7840;
}

/* 底部操作栏 */
.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 0.5rem;
}

.btn-reset {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #5e7a93;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e6edf4;
  border-color: #cbd5e1;
}

.btn-save {
  background: #1f5e4a;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #164b3b;
  transform: translateY(-1px);
}

/* Toast 提示 */
.toast-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1f5e4a;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 40px;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .permission-container {
    padding: 1rem;
  }
  .roles-overview {
    grid-template-columns: 1fr;
  }
  .perm-module {
    width: 180px;
  }
  .perm-action {
    width: 80px;
  }
  .perm-role {
    width: 70px;
  }
  .toast-message {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    text-align: center;
  }
}
</style>