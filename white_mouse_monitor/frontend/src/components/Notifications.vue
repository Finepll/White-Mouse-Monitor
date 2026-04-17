<template>
  <div class="notification-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>🔔 消息通知</h1>
        <div class="sub">查看系统公告、实验提醒与个人消息</div>
      </div>
      <div class="header-actions">
        <button class="btn-mark-all" @click="markAllAsRead" :disabled="unreadCount === 0">
          ✓ 全部标为已读
        </button>
        <button class="btn-delete-all" @click="clearAllRead" :disabled="readCount === 0">
          🗑️ 清空已读
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini" :class="{ active: filterType === 'all' }" @click="setFilter('all')">
        <div class="stat-number-mini">{{ totalCount }}</div>
        <div class="stat-label-mini">全部通知</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterType === 'unread' }" @click="setFilter('unread')">
        <div class="stat-number-mini">{{ unreadCount }}</div>
        <div class="stat-label-mini">未读</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterType === 'read' }" @click="setFilter('read')">
        <div class="stat-number-mini">{{ readCount }}</div>
        <div class="stat-label-mini">已读</div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="tab-btn"
        :class="{ active: activeCategory === cat.value }"
        @click="activeCategory = cat.value"
      >
        <span class="tab-icon">{{ cat.icon }}</span>
        <span>{{ cat.label }}</span>
        <span v-if="getCategoryUnreadCount(cat.value) > 0" class="unread-badge">
          {{ getCategoryUnreadCount(cat.value) }}
        </span>
      </button>
    </div>

    <!-- 角色快速筛选（管理员/审计员可见不同消息） -->
    <div class="role-hint" v-if="userRole === 'admin'">
      <span class="hint-icon">👑</span>
      <span class="hint-text">管理员身份 · 可查看所有角色相关公告</span>
    </div>
    <div class="role-hint" v-if="userRole === 'auditor'">
      <span class="hint-icon">📋</span>
      <span class="hint-text">审计员身份 · 接收审计相关通知与合规提醒</span>
    </div>
    <div class="role-hint" v-if="userRole === 'experimenter'">
      <span class="hint-icon">🔬</span>
      <span class="hint-text">实验人员身份 · 接收实验相关通知与进度提醒</span>
    </div>

    <!-- 通知列表 -->
    <div class="notification-list" v-if="filteredNotifications.length > 0">
      <div
        v-for="notification in paginatedNotifications"
        :key="notification.id"
        class="notification-card"
        :class="{ unread: !notification.isRead, [notification.type]: true }"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-icon">
          <span class="icon-emoji">{{ getTypeIcon(notification.type) }}</span>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <span class="notification-time">{{ formatTime(notification.time) }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div class="notification-footer">
            <span class="notification-category" :class="notification.category">
              {{ getCategoryLabel(notification.category) }}
            </span>
            <span class="notification-role" v-if="notification.targetRole">
              🎯 {{ getRoleLabel(notification.targetRole) }}
            </span>
          </div>
        </div>
        <div class="notification-actions" @click.stop>
          <button
            v-if="!notification.isRead"
            class="action-btn read-btn"
            @click="markAsRead(notification.id)"
            title="标为已读"
          >
            ✓
          </button>
          <button
            class="action-btn delete-btn"
            @click="deleteNotification(notification.id)"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <p>暂无{{ getFilterLabel() }}通知</p>
      <button v-if="filterType !== 'all'" class="btn-outline" @click="setFilter('all')">
        查看全部通知
      </button>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">←</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">→</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 当前角色（实际项目中从 store 获取）
const userRole = ref('experimenter') // 'experimenter', 'auditor', 'admin'

// 角色切换演示（仅开发用，实际应移除）
if (typeof window !== 'undefined') {
  window.setNotifyRole = (role) => {
    if (['experimenter', 'auditor', 'admin'].includes(role)) {
      userRole.value = role
      localStorage.setItem('demo_notify_role', role)
    }
  }
}

// 获取存储的角色
const getStoredRole = () => {
  const stored = localStorage.getItem('demo_notify_role')
  if (stored && ['experimenter', 'auditor', 'admin'].includes(stored)) {
    return stored
  }
  return 'experimenter'
}
userRole.value = getStoredRole()

// 通知数据类型定义
const generateMockNotifications = () => {
  const baseNotifications = [
    // 系统公告（所有人）
    {
      id: '1',
      title: '系统升级维护通知',
      message: '小鼠监测管理系统将于2025年1月25日22:00-02:00进行升级维护，期间部分功能可能无法使用，请提前保存数据。',
      time: '2025-01-20T10:30:00',
      isRead: false,
      type: 'system',
      category: 'announcement',
      targetRole: null
    },
    {
      id: '2',
      title: '数据备份完成',
      message: '本月实验数据已自动备份至云端存储，备份时间：2025-01-19 03:00:00',
      time: '2025-01-19T09:15:00',
      isRead: true,
      type: 'system',
      category: 'announcement',
      targetRole: null
    },
    // 实验人员专属
    {
      id: '3',
      title: '新批次小鼠到货提醒',
      message: 'SPF级C57BL/6小鼠（批次#B2025003）已入库，共48只，请相关实验人员及时登记领用。',
      time: '2025-01-18T14:20:00',
      isRead: false,
      type: 'experiment',
      category: 'reminder',
      targetRole: 'experimenter'
    },
    {
      id: '4',
      title: '实验进度提醒',
      message: '您的实验「抗肿瘤药物药效评估」已进入第14天，请按时记录体重及肿瘤体积数据。',
      time: '2025-01-17T08:00:00',
      isRead: false,
      type: 'experiment',
      category: 'reminder',
      targetRole: 'experimenter'
    },
    {
      id: '5',
      title: '动物福利审查',
      message: '请于本周五前提交动物实验伦理审查申请，逾期将暂停相关实验权限。',
      time: '2025-01-16T11:45:00',
      isRead: true,
      type: 'experiment',
      category: 'warning',
      targetRole: 'experimenter'
    },
    // 审计员专属
    {
      id: '6',
      title: '季度审计提醒',
      message: '2024年第四季度实验数据审计工作即将开始，请确保所有记录完整可追溯。',
      time: '2025-01-15T09:30:00',
      isRead: false,
      type: 'audit',
      category: 'reminder',
      targetRole: 'auditor'
    },
    {
      id: '7',
      title: 'GLP合规检查',
      message: '下周三将进行GLP合规突击检查，请提前准备好相关文档与记录。',
      time: '2025-01-14T16:20:00',
      isRead: true,
      type: 'audit',
      category: 'warning',
      targetRole: 'auditor'
    },
    // 管理员专属
    {
      id: '8',
      title: '新用户注册待审核',
      message: '有2名新用户等待审核，请及时处理账户开通申请。',
      time: '2025-01-18T10:00:00',
      isRead: false,
      type: 'admin',
      category: 'reminder',
      targetRole: 'admin'
    },
    {
      id: '9',
      title: '系统日志异常告警',
      message: '检测到异常登录尝试（IP: 203.0.113.45），已自动拦截，请检查安全设置。',
      time: '2025-01-17T22:35:00',
      isRead: false,
      type: 'admin',
      category: 'warning',
      targetRole: 'admin'
    },
    {
      id: '10',
      title: '存储空间即将用尽',
      message: '当前存储使用率已达85%，建议清理历史数据或扩容。',
      time: '2025-01-16T08:15:00',
      isRead: true,
      type: 'admin',
      category: 'warning',
      targetRole: 'admin'
    },
    // 通用个人消息
    {
      id: '11',
      title: '欢迎使用小鼠监测系统',
      message: '感谢您使用小白鼠监测管理系统，如有问题请联系技术支持。',
      time: '2025-01-10T09:00:00',
      isRead: true,
      type: 'personal',
      category: 'message',
      targetRole: null
    },
    {
      id: '12',
      title: '密码安全提醒',
      message: '您的密码已使用超过90天，建议尽快更换以保障账户安全。',
      time: '2025-01-12T15:30:00',
      isRead: false,
      type: 'personal',
      category: 'message',
      targetRole: null
    }
  ]

  // 根据角色过滤初始数据（保留系统公告和个人消息，再加上角色专属）
  return baseNotifications.filter(notif => {
    if (!notif.targetRole) return true
    return notif.targetRole === userRole.value || (userRole.value === 'admin' && notif.targetRole)
  })
}

const notifications = ref(generateMockNotifications())

// 筛选状态
const filterType = ref('all') // 'all', 'unread', 'read'
const activeCategory = ref('all') // 'all', 'announcement', 'reminder', 'warning', 'message'
const currentPage = ref(1)
const pageSize = 8

// 分类配置
const categories = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'announcement', label: '公告', icon: '📢' },
  { value: 'reminder', label: '提醒', icon: '⏰' },
  { value: 'warning', label: '告警', icon: '⚠️' },
  { value: 'message', label: '消息', icon: '💬' }
]

// 计算属性
const totalCount = computed(() => notifications.value.length)

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const readCount = computed(() => notifications.value.filter(n => n.isRead).length)

// 按分类筛选
const categoryFiltered = computed(() => {
  if (activeCategory.value === 'all') return notifications.value
  return notifications.value.filter(n => n.category === activeCategory.value)
})

// 按读状态筛选
const filteredNotifications = computed(() => {
  let result = categoryFiltered.value
  if (filterType.value === 'unread') {
    result = result.filter(n => !n.isRead)
  } else if (filterType.value === 'read') {
    result = result.filter(n => n.isRead)
  }
  return result
})

// 分页
const totalPages = computed(() => Math.ceil(filteredNotifications.value.length / pageSize))
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredNotifications.value.slice(start, end)
})

// 获取分类未读数
const getCategoryUnreadCount = (categoryValue) => {
  if (categoryValue === 'all') return unreadCount.value
  return notifications.value.filter(n => n.category === categoryValue && !n.isRead).length
}

// 获取类型图标
const getTypeIcon = (type) => {
  const icons = {
    system: '🏢',
    experiment: '🔬',
    audit: '📋',
    admin: '⚙️',
    personal: '👤'
  }
  return icons[type] || '📌'
}

// 获取分类标签
const getCategoryLabel = (category) => {
  const labels = {
    announcement: '公告',
    reminder: '提醒',
    warning: '告警',
    message: '消息'
  }
  return labels[category] || '通知'
}

// 获取角色标签
const getRoleLabel = (role) => {
  const labels = {
    experimenter: '实验人员',
    auditor: '审计员',
    admin: '管理员'
  }
  return labels[role] || ''
}

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const mins = Math.floor(diff / (1000 * 60))
      return mins === 0 ? '刚刚' : `${mins}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 操作方法
const setFilter = (type) => {
  filterType.value = type
  currentPage.value = 1
}

const markAsRead = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1 && !notifications.value[index].isRead) {
    notifications.value[index].isRead = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => {
    if (!n.isRead) n.isRead = true
  })
}

const deleteNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
    // 如果当前页没有数据了，回到上一页
    if (paginatedNotifications.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }
}

const clearAllRead = () => {
  notifications.value = notifications.value.filter(n => !n.isRead)
  currentPage.value = 1
}

const getFilterLabel = () => {
  if (filterType.value === 'unread') return '未读'
  if (filterType.value === 'read') return '已读'
  return ''
}

// 监听筛选变化，重置页码
import { watch } from 'vue'
watch([filterType, activeCategory], () => {
  currentPage.value = 1
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.notification-container {
  max-width: 1200px;
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

.header-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-mark-all,
.btn-delete-all {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-mark-all {
  background: #e0f2e9;
  color: #1f7840;
}

.btn-mark-all:hover:not(:disabled) {
  background: #c8e6d9;
}

.btn-delete-all {
  background: #f1f5f9;
  color: #8ba0b5;
  border: 1px solid #e2e8f0;
}

.btn-delete-all:hover:not(:disabled) {
  background: #ffe8e6;
  color: #bc4e2c;
  border-color: #f0c4be;
}

.btn-mark-all:disabled,
.btn-delete-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-card-mini {
  background: white;
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid #edf2f7;
  min-width: 100px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card-mini:hover {
  border-color: #cbdde6;
  transform: translateY(-1px);
}

.stat-card-mini.active {
  border-color: #2c9a6e;
  background: #f0faf5;
}

.stat-number-mini {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f5e4a;
}

.stat-label-mini {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #5e7a93;
  margin-top: 0.2rem;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  position: relative;
}

.tab-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.tab-btn.active {
  background: #1f5e4a;
  border-color: #1f5e4a;
  color: white;
}

.tab-icon {
  font-size: 0.9rem;
}

.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #e25c3e;
  color: white;
  font-size: 0.6rem;
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
}

/* 角色提示 */
.role-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #f0faf5;
  border-radius: 12px;
  margin-bottom: 1.2rem;
  font-size: 0.8rem;
  color: #1f5e4a;
  border-left: 3px solid #2c9a6e;
}

.hint-icon {
  font-size: 1rem;
}

.hint-text {
  font-weight: 500;
}

/* 通知列表 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: white;
  border-radius: 1rem;
  padding: 1rem 1.2rem;
  border: 1px solid #edf2f7;
  transition: all 0.2s;
  cursor: pointer;
}

.notification-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateX(2px);
}

.notification-card.unread {
  background: #fefef7;
  border-left: 3px solid #2c9a6e;
}

.notification-card.system {
  border-left-color: #6c9ebf;
}
.notification-card.experiment {
  border-left-color: #2c9a6e;
}
.notification-card.audit {
  border-left-color: #c26b2e;
}
.notification-card.admin {
  border-left-color: #bc4e2c;
}
.notification-card.personal {
  border-left-color: #8ba0b5;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 1.2rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.notification-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.notification-time {
  font-size: 0.7rem;
  color: #8ba0b5;
}

.notification-message {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.notification-footer {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.notification-category {
  font-size: 0.65rem;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  background: #f1f5f9;
  color: #5e7a93;
}

.notification-category.announcement {
  background: #e8f0fe;
  color: #4a6fa5;
}
.notification-category.reminder {
  background: #e0f2e9;
  color: #1f7840;
}
.notification-category.warning {
  background: #ffe8e6;
  color: #bc4e2c;
}
.notification-category.message {
  background: #f0e8fe;
  color: #7c5e9a;
}

.notification-role {
  font-size: 0.65rem;
  color: #8ba0b5;
}

.notification-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.read-btn {
  background: #e0f2e9;
  color: #1f7840;
}

.read-btn:hover {
  background: #c8e6d9;
  transform: scale(1.05);
}

.delete-btn {
  background: #f1f5f9;
  color: #8ba0b5;
}

.delete-btn:hover {
  background: #ffe8e6;
  color: #bc4e2c;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state p {
  color: #8ba0b5;
  margin-bottom: 1rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: #2c5f4a;
  cursor: pointer;
}

.btn-outline:hover {
  background: #eef2f5;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1rem 0;
}

.page-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #eef2f5;
  border-color: #cbd5e1;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  color: #475569;
}

/* 响应式 */
@media (max-width: 680px) {
  .notification-container {
    padding: 1rem;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .notification-card {
    flex-direction: column;
  }
  .notification-icon {
    width: 32px;
    height: 32px;
  }
  .notification-actions {
    align-self: flex-end;
  }
  .category-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.3rem;
  }
  .stats-row {
    justify-content: space-around;
  }
}
</style>