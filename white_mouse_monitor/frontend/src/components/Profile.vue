<template>
  <div class="profile-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>👤 个人资料</h1>
        <div class="sub">管理您的账户信息与安全设置</div>
      </div>
      <div class="role-badge" :class="roleClass">
        <span class="role-icon">{{ roleIcon }}</span>
        <span class="role-name">{{ roleName }}</span>
      </div>
    </div>

    <!-- 主要内容区：左右两栏布局 -->
    <div class="profile-grid">
      <!-- 左侧：头像与基本信息卡片 -->
      <div class="profile-sidebar">
        <div class="avatar-card">
          <div class="avatar-wrapper" @mouseenter="showAvatarEdit = true" @mouseleave="showAvatarEdit = false">
            <img :src="avatarUrl" class="avatar-image" alt="头像" />
            <div class="avatar-overlay" v-if="showAvatarEdit">
              <button class="avatar-edit-btn" @click="openAvatarModal">更换头像</button>
            </div>
          </div>
          <h2 class="user-name">{{ userInfo.name }}</h2>
          <p class="user-role" :class="roleClass">{{ roleName }}</p>
          <p class="user-email">{{ userInfo.email }}</p>
        </div>

        <div class="info-card">
          <div class="info-item">
            <span class="info-label">员工编号</span>
            <span class="info-value">{{ userInfo.employeeId }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属部门</span>
            <span class="info-value">{{ userInfo.department }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">入职日期</span>
            <span class="info-value">{{ userInfo.joinDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最后登录</span>
            <span class="info-value">{{ userInfo.lastLogin }}</span>
          </div>
        </div>

        <!-- 角色权限卡片 -->
        <div class="permission-card">
          <div class="permission-header">
            <span class="permission-icon">🔐</span>
            <span class="permission-title">角色权限</span>
          </div>
          <div class="permission-list">
            <div v-for="perm in permissions" :key="perm" class="permission-item">
              <span class="perm-dot"></span>
              <span>{{ perm }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：编辑表单 -->
      <div class="profile-main">
        <!-- 基本信息编辑 -->
        <div class="form-card">
          <div class="card-title">
            <span class="title-icon">📝</span>
            <span>基本信息</span>
            <button class="edit-toggle-btn" @click="toggleEditMode">
              {{ isEditing ? '取消编辑' : '编辑资料' }}
            </button>
          </div>
          <div v-if="!isEditing" class="info-display">
            <div class="display-row">
              <div class="display-label">姓名</div>
              <div class="display-value">{{ formData.name }}</div>
            </div>
            <div class="display-row">
              <div class="display-label">手机号码</div>
              <div class="display-value">{{ formData.phone || '未设置' }}</div>
            </div>
            <div class="display-row">
              <div class="display-label">办公电话</div>
              <div class="display-value">{{ formData.officePhone || '未设置' }}</div>
            </div>
            <div class="display-row">
              <div class="display-label">邮箱</div>
              <div class="display-value">{{ formData.email }}</div>
            </div>
            <div class="display-row">
              <div class="display-label">个人简介</div>
              <div class="display-value bio">{{ formData.bio || '这个人很懒，还没有填写简介~' }}</div>
            </div>
          </div>
          <div v-else class="edit-form">
            <div class="form-group">
              <label>姓名</label>
              <input type="text" v-model="formData.name" class="form-input" />
            </div>
            <div class="form-group">
              <label>手机号码</label>
              <input type="tel" v-model="formData.phone" class="form-input" placeholder="请输入手机号码" />
            </div>
            <div class="form-group">
              <label>办公电话</label>
              <input type="tel" v-model="formData.officePhone" class="form-input" placeholder="请输入办公电话" />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" v-model="formData.email" class="form-input" disabled />
              <span class="form-hint">邮箱不可修改，如需变更请联系管理员</span>
            </div>
            <div class="form-group">
              <label>个人简介</label>
              <textarea v-model="formData.bio" class="form-textarea" rows="4" placeholder="介绍一下自己吧~"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn-save" @click="saveProfile">保存修改</button>
              <button class="btn-cancel" @click="cancelEdit">取消</button>
            </div>
          </div>
        </div>

        <!-- 安全设置卡片（仅部分角色可见或内容不同） -->
        <div class="form-card">
          <div class="card-title">
            <span class="title-icon">🔒</span>
            <span>安全设置</span>
          </div>
          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <div class="security-label">登录密码</div>
                <div class="security-desc">建议定期更换密码，保障账户安全</div>
              </div>
              <button class="security-btn" @click="openPasswordModal">修改密码</button>
            </div>
            <div class="security-item">
              <div class="security-info">
                <div class="security-label">两步验证</div>
                <div class="security-desc">为账户添加额外的安全保护</div>
              </div>
              <button class="security-btn" :class="{ active: twoFactorEnabled }" @click="toggleTwoFactor">
                {{ twoFactorEnabled ? '已启用' : '未启用' }}
              </button>
            </div>
            <div class="security-item" v-if="userRole === 'admin'">
              <div class="security-info">
                <div class="security-label">会话管理</div>
                <div class="security-desc">查看和管理当前活跃的登录会话</div>
              </div>
              <button class="security-btn" @click="openSessionsModal">查看会话</button>
            </div>
          </div>
        </div>

        <!-- 登录历史卡片 -->
        <div class="form-card">
          <div class="card-title">
            <span class="title-icon">📜</span>
            <span>最近登录记录</span>
          </div>
          <div class="login-history">
            <div v-for="(log, idx) in loginHistory" :key="idx" class="history-item">
              <div class="history-time">{{ log.time }}</div>
              <div class="history-info">
                <span class="history-ip">{{ log.ip }}</span>
                <span class="history-device">{{ log.device }}</span>
              </div>
              <div class="history-status" :class="log.status === '成功' ? 'status-success' : 'status-fail'">
                {{ log.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="passwordModalVisible" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="close-btn" @click="closePasswordModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>当前密码</label>
            <input type="password" v-model="passwordForm.currentPwd" class="form-input" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input type="password" v-model="passwordForm.newPwd" class="form-input" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input type="password" v-model="passwordForm.confirmPwd" class="form-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closePasswordModal">取消</button>
          <button class="btn-primary" @click="changePassword">确认修改</button>
        </div>
      </div>
    </div>

    <!-- 更换头像模态框 -->
    <div v-if="avatarModalVisible" class="modal-overlay" @click.self="closeAvatarModal">
      <div class="modal-container avatar-modal">
        <div class="modal-header">
          <h3>更换头像</h3>
          <button class="close-btn" @click="closeAvatarModal">×</button>
        </div>
        <div class="modal-body">
          <div class="avatar-preview">
            <img :src="avatarPreview" class="preview-img" />
          </div>
          <div class="avatar-options">
            <div v-for="(opt, idx) in avatarOptions" :key="idx" class="avatar-option" @click="selectAvatar(opt)">
              <img :src="opt" class="option-img" />
            </div>
          </div>
          <div class="upload-area">
            <label class="upload-label">
              <input type="file" accept="image/*" @change="handleFileUpload" style="display: none" />
              <span class="upload-btn">📁 上传本地图片</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAvatarModal">取消</button>
          <button class="btn-primary" @click="saveAvatar">保存头像</button>
        </div>
      </div>
    </div>

    <!-- 会话管理模态框（仅管理员） -->
    <div v-if="sessionsModalVisible" class="modal-overlay" @click.self="closeSessionsModal">
      <div class="modal-container sessions-modal">
        <div class="modal-header">
          <h3>活跃会话</h3>
          <button class="close-btn" @click="closeSessionsModal">×</button>
        </div>
        <div class="modal-body">
          <div v-for="session in activeSessions" :key="session.id" class="session-item">
            <div class="session-info">
              <div class="session-device">{{ session.device }}</div>
              <div class="session-detail">{{ session.ip }} · {{ session.location }}</div>
              <div class="session-time">{{ session.lastActive }}</div>
            </div>
            <button class="revoke-btn" @click="revokeSession(session.id)">撤销</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeSessionsModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 角色定义
const userRole = ref('experimenter') // 'experimenter', 'auditor', 'admin'
// 实际项目中应从 store 或路由获取，这里模拟切换演示
// 可以通过 URL 参数或下拉菜单切换，为方便演示，在控制台可修改

// 角色配置
const roleConfig = {
  experimenter: {
    name: '实验人员',
    icon: '🔬',
    class: 'role-experimenter',
    permissions: [
      '查看小鼠档案',
      '新增/编辑实验记录',
      '导出实验数据',
      '查看个人资料'
    ]
  },
  auditor: {
    name: '审计员',
    icon: '📋',
    class: 'role-auditor',
    permissions: [
      '查看所有档案',
      '审计日志查询',
      '数据完整性校验',
      '生成审计报告'
    ]
  },
  admin: {
    name: '管理员',
    icon: '⚙️',
    class: 'role-admin',
    permissions: [
      '用户管理',
      '角色权限配置',
      '系统日志查看',
      '所有数据操作权限'
    ]
  }
}

// 当前角色（可以从 localStorage 或 store 获取）
// 为方便演示，这里提供角色切换方法（实际使用中请根据登录用户设置）
const getCurrentRole = () => {
  // 模拟：从 localStorage 获取，默认为实验人员
  const stored = localStorage.getItem('demo_user_role')
  if (stored && ['experimenter', 'auditor', 'admin'].includes(stored)) {
    return stored
  }
  return 'experimenter'
}

const currentRoleRaw = ref(getCurrentRole())

// 切换角色（仅用于演示，实际项目中移除）
window.setRole = (role) => {
  if (['experimenter', 'auditor', 'admin'].includes(role)) {
    currentRoleRaw.value = role
    localStorage.setItem('demo_user_role', role)
    // 刷新页面数据
    loadUserInfoByRole()
  }
}

// 根据角色加载不同的用户信息
const loadUserInfoByRole = () => {
  const role = currentRoleRaw.value
  if (role === 'experimenter') {
    userInfo.value = {
      name: '张明远',
      employeeId: 'EXP-2024001',
      department: '实验动物中心',
      joinDate: '2024-03-15',
      lastLogin: '2025-01-20 14:30:25',
      email: 'mingyuan.zhang@lab.com',
      phone: '13800138001',
      officePhone: '021-12345678',
      bio: '从事小鼠行为学研究5年，负责SPF级动物房日常管理。'
    }
    formData.value = { ...userInfo.value }
  } else if (role === 'auditor') {
    userInfo.value = {
      name: '李慧敏',
      employeeId: 'AUD-2023008',
      department: '质量审计部',
      joinDate: '2023-08-01',
      lastLogin: '2025-01-19 09:15:42',
      email: 'huimin.li@lab.com',
      phone: '13800138002',
      officePhone: '021-87654321',
      bio: 'GLP审计专员，负责实验数据合规性审查。'
    }
    formData.value = { ...userInfo.value }
  } else {
    userInfo.value = {
      name: '王建国',
      employeeId: 'ADM-2022001',
      department: '系统管理部',
      joinDate: '2022-01-10',
      lastLogin: '2025-01-20 08:45:12',
      email: 'jianguo.wang@lab.com',
      phone: '13800138003',
      officePhone: '021-11223344',
      bio: '系统架构师，负责小鼠监测系统的运维与安全管理。'
    }
    formData.value = { ...userInfo.value }
  }
}

// 用户信息
const userInfo = ref({
  name: '',
  employeeId: '',
  department: '',
  joinDate: '',
  lastLogin: '',
  email: '',
  phone: '',
  officePhone: '',
  bio: ''
})

const formData = ref({ ...userInfo.value })

// 头像相关
const defaultAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=experimenter',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=auditor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
]
const avatarUrl = ref(defaultAvatars[0])
const avatarPreview = ref(avatarUrl.value)
const avatarOptions = ref([...defaultAvatars, 'https://api.dicebear.com/7.x/avataaars/svg?seed=cat', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dog'])
const showAvatarEdit = ref(false)
const avatarModalVisible = ref(false)
const selectedAvatar = ref('')

// 密码修改
const passwordModalVisible = ref(false)
const passwordForm = ref({
  currentPwd: '',
  newPwd: '',
  confirmPwd: ''
})

// 两步验证
const twoFactorEnabled = ref(false)

// 会话管理
const sessionsModalVisible = ref(false)
const activeSessions = ref([
  { id: 1, device: 'Chrome on Windows', ip: '192.168.1.101', location: '上海', lastActive: '当前会话' },
  { id: 2, device: 'Safari on iPhone', ip: '10.0.0.55', location: '上海', lastActive: '2025-01-19 20:30' }
])

// 登录历史
const loginHistory = ref([
  { time: '2025-01-20 14:30:25', ip: '192.168.1.101', device: 'Chrome / Windows', status: '成功' },
  { time: '2025-01-19 09:15:42', ip: '10.0.0.55', device: 'Safari / iPhone', status: '成功' },
  { time: '2025-01-18 16:20:10', ip: '192.168.1.105', device: 'Edge / Windows', status: '成功' },
  { time: '2025-01-17 08:55:33', ip: '172.16.0.8', device: 'Firefox / macOS', status: '失败' }
])

// 编辑状态
const isEditing = ref(false)

// 计算属性
const roleName = computed(() => roleConfig[currentRoleRaw.value]?.name || '未知角色')
const roleIcon = computed(() => roleConfig[currentRoleRaw.value]?.icon || '👤')
const roleClass = computed(() => roleConfig[currentRoleRaw.value]?.class || '')
const permissions = computed(() => roleConfig[currentRoleRaw.value]?.permissions || [])

// 方法
const toggleEditMode = () => {
  if (isEditing.value) {
    cancelEdit()
  } else {
    isEditing.value = true
  }
}

const cancelEdit = () => {
  formData.value = { ...userInfo.value }
  isEditing.value = false
}

const saveProfile = () => {
  userInfo.value = { ...formData.value }
  isEditing.value = false
  alert('个人资料已更新')
}

// 头像相关
const openAvatarModal = () => {
  avatarPreview.value = avatarUrl.value
  avatarModalVisible.value = true
}

const selectAvatar = (url) => {
  avatarPreview.value = url
  selectedAvatar.value = url
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      avatarPreview.value = ev.target.result
      selectedAvatar.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveAvatar = () => {
  if (selectedAvatar.value) {
    avatarUrl.value = selectedAvatar.value
  }
  avatarModalVisible.value = false
}

const closeAvatarModal = () => {
  avatarModalVisible.value = false
  selectedAvatar.value = ''
}

// 密码修改
const openPasswordModal = () => {
  passwordForm.value = { currentPwd: '', newPwd: '', confirmPwd: '' }
  passwordModalVisible.value = true
}

const closePasswordModal = () => {
  passwordModalVisible.value = false
}

const changePassword = () => {
  if (!passwordForm.value.currentPwd) {
    alert('请输入当前密码')
    return
  }
  if (passwordForm.value.newPwd !== passwordForm.value.confirmPwd) {
    alert('两次输入的新密码不一致')
    return
  }
  if (passwordForm.value.newPwd.length < 6) {
    alert('新密码长度至少6位')
    return
  }
  alert('密码修改成功，请重新登录')
  passwordModalVisible.value = false
}

// 两步验证
const toggleTwoFactor = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
  alert(twoFactorEnabled.value ? '两步验证已开启' : '两步验证已关闭')
}

// 会话管理
const openSessionsModal = () => {
  sessionsModalVisible.value = true
}

const closeSessionsModal = () => {
  sessionsModalVisible.value = false
}

const revokeSession = (id) => {
  activeSessions.value = activeSessions.value.filter(s => s.id !== id)
  alert('已撤销该会话')
}

// 初始化加载
loadUserInfoByRole()
// 根据角色设置默认头像
avatarUrl.value = defaultAvatars[currentRoleRaw.value === 'experimenter' ? 0 : currentRoleRaw.value === 'auditor' ? 1 : 2]
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.profile-container {
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
  margin-bottom: 1.8rem;
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

/* 角色徽章 */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-experimenter {
  background: #e0f2e9;
  color: #1f7840;
}

.role-auditor {
  background: #fff0e0;
  color: #c26b2e;
}

.role-admin {
  background: #ffe8e6;
  color: #bc4e2c;
}

/* 主网格布局 */
.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

/* 侧边栏 */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.avatar-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.8rem 1.5rem;
  text-align: center;
  border: 1px solid #edf2f7;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-edit-btn {
  background: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  color: #1f5e4a;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.3rem;
}

.user-role {
  font-size: 0.8rem;
  padding: 0.2rem 0.8rem;
  display: inline-block;
  border-radius: 20px;
  margin-bottom: 0.6rem;
}

.user-email {
  font-size: 0.8rem;
  color: #6b85a0;
}

.info-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.2rem 1.5rem;
  border: 1px solid #edf2f7;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f0f3f9;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.75rem;
  color: #8ba0b5;
}

.info-value {
  font-size: 0.85rem;
  color: #2d3e50;
  font-weight: 500;
}

/* 权限卡片 */
.permission-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.2rem 1.5rem;
  border: 1px solid #edf2f7;
}

.permission-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eef2f6;
}

.permission-icon {
  font-size: 1rem;
}

.permission-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c4b3e;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #475569;
}

.perm-dot {
  width: 5px;
  height: 5px;
  background: #2c9a6e;
  border-radius: 50%;
}

/* 右侧主内容区 */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f6;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c4b3e;
}

.title-icon {
  font-size: 1rem;
}

.edit-toggle-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid #e2e8f0;
  padding: 0.3rem 1rem;
  border-radius: 40px;
  font-size: 0.7rem;
  cursor: pointer;
  color: #2c5f4a;
  transition: all 0.2s;
}

.edit-toggle-btn:hover {
  background: #eef6f2;
  border-color: #bdd9cc;
}

/* 信息展示 */
.info-display {
  padding: 1rem 1.5rem;
}

.display-row {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f3f9;
}

.display-row:last-child {
  border-bottom: none;
}

.display-label {
  width: 100px;
  font-size: 0.8rem;
  color: #8ba0b5;
  flex-shrink: 0;
}

.display-value {
  flex: 1;
  font-size: 0.85rem;
  color: #2d3e50;
}

.display-value.bio {
  line-height: 1.5;
}

/* 编辑表单 */
.edit-form {
  padding: 1.2rem 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  font-family: inherit;
  transition: all 0.2s;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.08);
}

.form-hint {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
  display: block;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.btn-save {
  background: #1f5e4a;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #164b3b;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.5rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #5e7a93;
  cursor: pointer;
}

/* 安全设置列表 */
.security-list {
  padding: 0.5rem 1rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f0f3f9;
}

.security-item:last-child {
  border-bottom: none;
}

.security-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
}

.security-desc {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.security-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 1rem;
  border-radius: 40px;
  font-size: 0.75rem;
  cursor: pointer;
  color: #2c5f4a;
  transition: all 0.2s;
}

.security-btn.active {
  background: #e0f2e9;
  border-color: #2c9a6e;
  color: #1f7840;
}

.security-btn:hover {
  background: #e6edf4;
}

/* 登录历史 */
.login-history {
  padding: 0.5rem 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0.5rem;
  border-bottom: 1px solid #f0f3f9;
  font-size: 0.8rem;
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  width: 140px;
  color: #6b85a0;
  font-size: 0.75rem;
}

.history-info {
  flex: 1;
  display: flex;
  gap: 1rem;
  color: #475569;
}

.history-ip {
  font-family: monospace;
  font-size: 0.75rem;
}

.history-device {
  font-size: 0.75rem;
}

.history-status {
  width: 50px;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-success {
  color: #1f7840;
}

.status-fail {
  color: #bc4e2c;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 1.25rem;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eef2f6;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eef2f6;
}

.btn-primary {
  background: #1f5e4a;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #2c5f4a;
  cursor: pointer;
}

/* 头像选择 */
.avatar-modal {
  max-width: 520px;
}

.avatar-preview {
  text-align: center;
  margin-bottom: 1.5rem;
}

.preview-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-options {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-option {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.avatar-option:hover {
  border-color: #2c9a6e;
  transform: scale(1.05);
}

.option-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-area {
  text-align: center;
  margin-top: 1rem;
}

.upload-label {
  cursor: pointer;
}

.upload-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 40px;
  font-size: 0.8rem;
  color: #2c5f4a;
}

/* 会话管理 */
.sessions-modal {
  max-width: 560px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f3f9;
}

.session-item:last-child {
  border-bottom: none;
}

.session-device {
  font-weight: 500;
  font-size: 0.85rem;
}

.session-detail {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.session-time {
  font-size: 0.7rem;
  color: #6b85a0;
  margin-top: 0.2rem;
}

.revoke-btn {
  background: #ffe8e6;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #bc4e2c;
  cursor: pointer;
}

.revoke-btn:hover {
  background: #fdd8d5;
}
</style>