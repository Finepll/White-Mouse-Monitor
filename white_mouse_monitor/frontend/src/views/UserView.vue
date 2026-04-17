<template>
  <div class="user-management-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>👥 用户管理</h1>
        <div class="sub">管理系统用户、角色权限与账户状态</div>
      </div>
      <button class="btn-create" @click="openCreateModal">
        <span class="btn-icon">+</span> 新建用户
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini" :class="{ active: filterRole === 'all' }" @click="setRoleFilter('all')">
        <div class="stat-number-mini">{{ totalCount }}</div>
        <div class="stat-label-mini">总用户</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterRole === 'experimenter' }" @click="setRoleFilter('experimenter')">
        <div class="stat-number-mini">{{ experimenterCount }}</div>
        <div class="stat-label-mini">实验人员</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterRole === 'auditor' }" @click="setRoleFilter('auditor')">
        <div class="stat-number-mini">{{ auditorCount }}</div>
        <div class="stat-label-mini">审计员</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterRole === 'admin' }" @click="setRoleFilter('admin')">
        <div class="stat-number-mini">{{ adminCount }}</div>
        <div class="stat-label-mini">管理员</div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索姓名、工号或邮箱..."
        />
      </div>
      <div class="status-filter">
        <button
          class="status-filter-btn"
          :class="{ active: filterStatus === 'all' }"
          @click="filterStatus = 'all'"
        >
          全部
        </button>
        <button
          class="status-filter-btn"
          :class="{ active: filterStatus === 'active' }"
          @click="filterStatus = 'active'"
        >
          <span class="dot-active"></span> 启用
        </button>
        <button
          class="status-filter-btn"
          :class="{ active: filterStatus === 'inactive' }"
          @click="filterStatus = 'inactive'"
        >
          <span class="dot-inactive"></span> 禁用
        </button>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="table-wrapper">
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <p>暂无用户数据</p>
        <button class="btn-outline" @click="openCreateModal">创建第一个用户</button>
      </div>
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>用户信息</th>
            <th>工号</th>
            <th>角色</th>
            <th>邮箱</th>
            <th>状态</th>
            <th>最后登录</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td class="user-cell">
              <div class="user-avatar" :style="{ background: getAvatarColor(user.role) }">
                {{ getInitials(user.name) }}
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-dept">{{ user.department }}</div>
              </div>
            </td>
            <td class="mono-text">{{ user.employeeId }}</td>
            <td>
              <span class="role-badge" :class="getRoleClass(user.role)">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="status-badge" :class="user.status === 'active' ? 'status-active' : 'status-inactive'">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td class="time-text">{{ user.lastLogin || '从未登录' }}</td>
            <td class="action-cell">
              <button class="action-icon" @click="openEditModal(user)" title="编辑">
                ✏️
              </button>
              <button class="action-icon" @click="toggleUserStatus(user)" :title="user.status === 'active' ? '禁用' : '启用'">
                {{ user.status === 'active' ? '🔒' : '🔓' }}
              </button>
              <button class="action-icon delete-icon" @click="confirmDelete(user)" title="删除">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">←</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">→</button>
      </div>
    </div>

    <!-- 新建/编辑模态框 -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEditMode ? '编辑用户' : '新建用户' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>姓名 <span class="required">*</span></label>
              <input type="text" v-model="formData.name" class="form-input" placeholder="请输入姓名" />
            </div>
            <div class="form-group">
              <label>工号 <span class="required">*</span></label>
              <input type="text" v-model="formData.employeeId" class="form-input" placeholder="请输入工号" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>邮箱 <span class="required">*</span></label>
              <input type="email" v-model="formData.email" class="form-input" placeholder="example@lab.com" />
            </div>
            <div class="form-group">
              <label>手机号码</label>
              <input type="tel" v-model="formData.phone" class="form-input" placeholder="请输入手机号" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>角色 <span class="required">*</span></label>
              <select v-model="formData.role" class="form-select">
                <option value="experimenter">实验人员</option>
                <option value="auditor">审计员</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div class="form-group">
              <label>所属部门</label>
              <input type="text" v-model="formData.department" class="form-input" placeholder="请输入部门" />
            </div>
          </div>
          <div class="form-row" v-if="!isEditMode">
            <div class="form-group">
              <label>初始密码</label>
              <input type="password" v-model="formData.password" class="form-input" placeholder="留空则使用默认密码" />
              <span class="form-hint">默认密码：123456</span>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="formData.status" class="form-select">
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>
          <div class="form-group" v-else>
            <label>状态</label>
            <select v-model="formData.status" class="form-select">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="formData.remark" class="form-textarea" rows="2" placeholder="其他说明信息..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveUser">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="deleteConfirmVisible" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal-container delete-modal">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-body">
          <p>确定要删除用户 <strong>{{ deleteTarget?.name }}</strong> 吗？</p>
          <p class="warning-text">此操作不可恢复，该用户的所有数据将被移除。</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDeleteConfirm">取消</button>
          <button class="btn-danger" @click="performDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 模拟用户数据
const generateMockUsers = () => {
  return [
    {
      id: '1',
      name: '张明远',
      employeeId: 'EXP-2024001',
      email: 'mingyuan.zhang@lab.com',
      phone: '13800138001',
      role: 'experimenter',
      department: '实验动物中心',
      status: 'active',
      lastLogin: '2025-01-20 14:30:25',
      remark: '资深实验员，负责SPF级动物房'
    },
    {
      id: '2',
      name: '李慧敏',
      employeeId: 'AUD-2023008',
      email: 'huimin.li@lab.com',
      phone: '13800138002',
      role: 'auditor',
      department: '质量审计部',
      status: 'active',
      lastLogin: '2025-01-19 09:15:42',
      remark: 'GLP审计专员'
    },
    {
      id: '3',
      name: '王建国',
      employeeId: 'ADM-2022001',
      email: 'jianguo.wang@lab.com',
      phone: '13800138003',
      role: 'admin',
      department: '系统管理部',
      status: 'active',
      lastLogin: '2025-01-20 08:45:12',
      remark: '系统管理员'
    },
    {
      id: '4',
      name: '陈晓雨',
      employeeId: 'EXP-2024012',
      email: 'xiaoyu.chen@lab.com',
      phone: '13800138004',
      role: 'experimenter',
      department: '肿瘤研究中心',
      status: 'active',
      lastLogin: '2025-01-18 11:20:00',
      remark: '新入职实验员'
    },
    {
      id: '5',
      name: '赵志远',
      employeeId: 'AUD-2023015',
      email: 'zhiyuan.zhao@lab.com',
      phone: '13800138005',
      role: 'auditor',
      department: '合规部',
      status: 'inactive',
      lastLogin: '2024-12-10 16:30:00',
      remark: '离职待处理'
    },
    {
      id: '6',
      name: '孙丽华',
      employeeId: 'EXP-2023055',
      email: 'lihua.sun@lab.com',
      phone: '13800138006',
      role: 'experimenter',
      department: '神经科学研究所',
      status: 'active',
      lastLogin: '2025-01-17 10:15:00',
      remark: '行为学专家'
    },
    {
      id: '7',
      name: '周明德',
      employeeId: 'ADM-2022008',
      email: 'mingde.zhou@lab.com',
      phone: '13800138007',
      role: 'admin',
      department: '系统管理部',
      status: 'active',
      lastLogin: '2025-01-19 14:20:00',
      remark: '数据库管理员'
    },
    {
      id: '8',
      name: '吴雅婷',
      employeeId: 'EXP-2024020',
      email: 'yating.wu@lab.com',
      phone: '13800138008',
      role: 'experimenter',
      department: '药效评价中心',
      status: 'active',
      lastLogin: '2025-01-16 09:45:00',
      remark: ''
    },
    {
      id: '9',
      name: '郑浩然',
      employeeId: 'AUD-2024003',
      email: 'haoran.zheng@lab.com',
      phone: '13800138009',
      role: 'auditor',
      department: '质量审计部',
      status: 'inactive',
      lastLogin: '2025-01-10 13:30:00',
      remark: '试用期'
    },
    {
      id: '10',
      name: '林芳',
      employeeId: 'EXP-2024018',
      email: 'fang.lin@lab.com',
      phone: '13800138010',
      role: 'experimenter',
      department: '实验动物中心',
      status: 'active',
      lastLogin: '2025-01-19 16:20:00',
      remark: ''
    }
  ]
}

const users = ref(generateMockUsers())

// 筛选条件
const searchKeyword = ref('')
const filterRole = ref('all')
const filterStatus = ref('all')
const currentPage = ref(1)
const pageSize = 8

// 模态框状态
const modalVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const formData = ref({
  name: '',
  employeeId: '',
  email: '',
  phone: '',
  role: 'experimenter',
  department: '',
  status: 'active',
  password: '',
  remark: ''
})

// 删除确认
const deleteConfirmVisible = ref(false)
const deleteTarget = ref(null)

// 计算属性
const totalCount = computed(() => users.value.length)
const experimenterCount = computed(() => users.value.filter(u => u.role === 'experimenter').length)
const auditorCount = computed(() => users.value.filter(u => u.role === 'auditor').length)
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)

const filteredUsers = computed(() => {
  let result = [...users.value]

  // 角色筛选
  if (filterRole.value !== 'all') {
    result = result.filter(u => u.role === filterRole.value)
  }

  // 状态筛选
  if (filterStatus.value !== 'all') {
    result = result.filter(u => u.status === filterStatus.value)
  }

  // 搜索筛选
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(u =>
      u.name.toLowerCase().includes(kw) ||
      u.employeeId.toLowerCase().includes(kw) ||
      u.email.toLowerCase().includes(kw)
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredUsers.value.slice(start, end)
})

// 辅助函数
const getRoleLabel = (role) => {
  const labels = {
    experimenter: '实验人员',
    auditor: '审计员',
    admin: '管理员'
  }
  return labels[role] || role
}

const getRoleClass = (role) => {
  return {
    experimenter: 'role-experimenter',
    auditor: 'role-auditor',
    admin: 'role-admin'
  }[role]
}

const getAvatarColor = (role) => {
  const colors = {
    experimenter: '#e0f2e9',
    auditor: '#fff0e0',
    admin: '#ffe8e6'
  }
  return colors[role] || '#e8f0fe'
}

const getInitials = (name) => {
  return name.charAt(0)
}

// 筛选方法
const setRoleFilter = (role) => {
  filterRole.value = role
  currentPage.value = 1
}

// 打开新建模态框
const openCreateModal = () => {
  isEditMode.value = false
  editId.value = null
  formData.value = {
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    role: 'experimenter',
    department: '',
    status: 'active',
    password: '',
    remark: ''
  }
  modalVisible.value = true
}

// 打开编辑模态框
const openEditModal = (user) => {
  isEditMode.value = true
  editId.value = user.id
  formData.value = {
    name: user.name,
    employeeId: user.employeeId,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    department: user.department || '',
    status: user.status,
    password: '',
    remark: user.remark || ''
  }
  modalVisible.value = true
}

// 关闭模态框
const closeModal = () => {
  modalVisible.value = false
}

// 保存用户
const saveUser = () => {
  // 验证必填字段
  if (!formData.value.name.trim()) {
    alert('请填写姓名')
    return
  }
  if (!formData.value.employeeId.trim()) {
    alert('请填写工号')
    return
  }
  if (!formData.value.email.trim()) {
    alert('请填写邮箱')
    return
  }

  if (isEditMode.value) {
    // 编辑现有用户
    const index = users.value.findIndex(u => u.id === editId.value)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        name: formData.value.name,
        employeeId: formData.value.employeeId,
        email: formData.value.email,
        phone: formData.value.phone,
        role: formData.value.role,
        department: formData.value.department,
        status: formData.value.status,
        remark: formData.value.remark
      }
    }
  } else {
    // 新建用户
    const newId = String(Date.now())
    const newUser = {
      id: newId,
      name: formData.value.name,
      employeeId: formData.value.employeeId,
      email: formData.value.email,
      phone: formData.value.phone,
      role: formData.value.role,
      department: formData.value.department,
      status: formData.value.status,
      lastLogin: '从未登录',
      remark: formData.value.remark
    }
    users.value.push(newUser)
  }
  closeModal()
}

// 切换用户状态
const toggleUserStatus = (user) => {
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index].status = user.status === 'active' ? 'inactive' : 'active'
  }
}

// 删除确认
const confirmDelete = (user) => {
  deleteTarget.value = user
  deleteConfirmVisible.value = true
}

const closeDeleteConfirm = () => {
  deleteConfirmVisible.value = false
  deleteTarget.value = null
}

const performDelete = () => {
  if (deleteTarget.value) {
    const index = users.value.findIndex(u => u.id === deleteTarget.value.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }
  closeDeleteConfirm()
}

// 监听筛选变化重置页码
import { watch } from 'vue'
watch([searchKeyword, filterRole, filterStatus], () => {
  currentPage.value = 1
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.user-management-container {
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

.btn-create {
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

.btn-create:hover {
  background: #164b3b;
  transform: translateY(-1px);
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

/* 搜索栏 */
.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  flex: 2;
  min-width: 200px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 0.7rem 0.7rem 0.7rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 0.85rem;
  background: white;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
}

.status-filter {
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.2rem;
  border-radius: 40px;
  border: 1px solid #e2e8f0;
}

.status-filter-btn {
  padding: 0.4rem 1rem;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.status-filter-btn.active {
  background: #1f5e4a;
  color: white;
}

.dot-active {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2c9a6e;
  display: inline-block;
}

.dot-inactive {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #bc4e2c;
  display: inline-block;
}

/* 表格 */
.table-wrapper {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 800px;
}

.user-table th {
  text-align: left;
  padding: 1rem 1rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  color: #2c4b3e;
}

.user-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f0f3f9;
  color: #2d3e50;
  vertical-align: middle;
}

.user-table tr:hover td {
  background-color: #fafefb;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c4b3e;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #1e293b;
}

.user-dept {
  font-size: 0.7rem;
  color: #8ba0b5;
}

.mono-text {
  font-family: monospace;
  font-size: 0.8rem;
}

.time-text {
  font-size: 0.75rem;
  color: #6b85a0;
}

/* 角色徽章 */
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 40px;
  font-size: 0.7rem;
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

/* 状态徽章 */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-active {
  background: #e0f2e9;
  color: #1f7840;
}

.status-inactive {
  background: #ffe8e6;
  color: #bc4e2c;
}

/* 操作按钮 */
.action-cell {
  display: flex;
  gap: 0.3rem;
}

.action-icon {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;
  transition: all 0.2s;
  color: #8ba0b5;
}

.action-icon:hover {
  background: #f0f4f9;
  color: #1f5e4a;
}

.delete-icon:hover {
  color: #bc4e2c;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
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
  max-width: 560px;
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
  line-height: 1;
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

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.required {
  color: #e25c3e;
}

.form-input,
.form-select,
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
.form-select:focus,
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

.btn-primary {
  background: #1f5e4a;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #2c5f4a;
  cursor: pointer;
}

.btn-danger {
  background: #e25c3e;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
}

.delete-modal {
  max-width: 400px;
}

.warning-text {
  color: #e25c3e;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* 响应式 */
@media (max-width: 680px) {
  .user-management-container {
    padding: 1rem;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .stats-row {
    justify-content: space-around;
  }
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .status-filter {
    justify-content: center;
  }
}
</style>