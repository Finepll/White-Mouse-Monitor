<template>
  <div class="operation-log-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📋 操作日志</h1>
        <div class="sub">记录系统所有操作行为 · 可追溯审计</div>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportLogs">
          <span class="export-icon">📎</span> 导出日志
        </button>
        <button class="btn-refresh" @click="refreshLogs">
          <span class="refresh-icon">⟳</span> 刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalCount }}</div>
        <div class="stat-label-mini">总操作数</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ todayCount }}</div>
        <div class="stat-label-mini">今日操作</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ thisWeekCount }}</div>
        <div class="stat-label-mini">本周操作</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ userCount }}</div>
        <div class="stat-label-mini">活跃用户</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索操作人、操作内容、IP地址..."
          />
        </div>
        <select v-model="filterRole" class="filter-select">
          <option value="all">全部角色</option>
          <option value="experimenter">实验人员</option>
          <option value="auditor">审计员</option>
          <option value="admin">管理员</option>
        </select>
        <select v-model="filterAction" class="filter-select">
          <option value="all">全部操作类型</option>
          <option value="CREATE">创建</option>
          <option value="UPDATE">更新</option>
          <option value="DELETE">删除</option>
          <option value="EXPORT">导出</option>
          <option value="LOGIN">登录</option>
          <option value="LOGOUT">登出</option>
          <option value="CONFIG">配置</option>
        </select>
      </div>
      <div class="filter-row">
        <div class="date-range">
          <input type="date" v-model="dateStart" class="date-input" placeholder="开始日期" />
          <span class="range-sep">至</span>
          <input type="date" v-model="dateEnd" class="date-input" placeholder="结束日期" />
        </div>
        <button class="btn-reset" @click="resetFilters">
          <span class="reset-icon">⟳</span> 重置筛选
        </button>
      </div>
    </div>

    <!-- 日志表格 -->
    <div class="table-wrapper">
      <div v-if="filteredLogs.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无操作日志</p>
      </div>
      <table v-else class="log-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>操作人</th>
            <th>角色</th>
            <th>操作类型</th>
            <th>操作内容</th>
            <th>IP地址</th>
            <th>状态</th>
            <th>详情</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in paginatedLogs" :key="log.id">
            <td class="time-cell">{{ formatDateTime(log.time) }}</td>
            <td class="user-cell">
              <div class="user-avatar-small" :style="{ background: getAvatarColor(log.role) }">
                {{ getInitials(log.userName) }}
              </div>
              <span>{{ log.userName }}</span>
             </td>
            <td>
              <span class="role-badge" :class="getRoleClass(log.role)">
                {{ getRoleLabel(log.role) }}
              </span>
            </td>
            <td>
              <span class="action-badge" :class="getActionClass(log.action)">
                {{ log.action }}
              </span>
            </td>
            <td class="content-cell">
              <span class="log-content">{{ log.content }}</span>
              <div class="log-target" v-if="log.target">目标: {{ log.target }}</div>
            </td>
            <td class="ip-cell">{{ log.ip }}</td>
            <td>
              <span class="status-badge" :class="log.status === 'success' ? 'status-success' : 'status-fail'">
                {{ log.status === 'success' ? '成功' : '失败' }}
              </span>
            </td>
            <td>
              <button class="detail-btn" @click="viewDetail(log)">查看</button>
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

    <!-- 日志详情模态框 -->
    <div v-if="detailModalVisible" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h3>📄 日志详情</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedLog">
          <div class="detail-grid">
            <div class="detail-item">
              <label>操作时间</label>
              <span>{{ formatDateTime(selectedLog.time) }}</span>
            </div>
            <div class="detail-item">
              <label>操作人</label>
              <span>{{ selectedLog.userName }} ({{ getRoleLabel(selectedLog.role) }})</span>
            </div>
            <div class="detail-item">
              <label>工号</label>
              <span>{{ selectedLog.employeeId || '—' }}</span>
            </div>
            <div class="detail-item">
              <label>IP地址</label>
              <span>{{ selectedLog.ip }}</span>
            </div>
            <div class="detail-item">
              <label>操作类型</label>
              <span class="action-badge" :class="getActionClass(selectedLog.action)">{{ selectedLog.action }}</span>
            </div>
            <div class="detail-item">
              <label>状态</label>
              <span class="status-badge" :class="selectedLog.status === 'success' ? 'status-success' : 'status-fail'">
                {{ selectedLog.status === 'success' ? '成功' : '失败' }}
              </span>
            </div>
            <div class="detail-item full-width">
              <label>操作内容</label>
              <span>{{ selectedLog.content }}</span>
            </div>
            <div class="detail-item full-width" v-if="selectedLog.target">
              <label>操作目标</label>
              <span>{{ selectedLog.target }}</span>
            </div>
            <div class="detail-item full-width" v-if="selectedLog.detail">
              <label>详细信息</label>
              <pre class="detail-json">{{ JSON.stringify(selectedLog.detail, null, 2) }}</pre>
            </div>
            <div class="detail-item full-width" v-if="selectedLog.errorMsg">
              <label>错误信息</label>
              <span class="error-text">{{ selectedLog.errorMsg }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 模拟操作日志数据
const generateMockLogs = () => {
  const users = [
    { name: '张明远', role: 'experimenter', employeeId: 'EXP-2024001' },
    { name: '李慧敏', role: 'auditor', employeeId: 'AUD-2023008' },
    { name: '王建国', role: 'admin', employeeId: 'ADM-2022001' },
    { name: '陈晓雨', role: 'experimenter', employeeId: 'EXP-2024012' },
    { name: '赵志远', role: 'auditor', employeeId: 'AUD-2023015' },
    { name: '孙丽华', role: 'experimenter', employeeId: 'EXP-2023055' }
  ]
  
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'LOGOUT', 'CONFIG']
  const actionContents = {
    CREATE: ['新建档案', '创建用户', '添加分类', '新增实验记录'],
    UPDATE: ['更新档案信息', '修改密码', '编辑用户资料', '更新配置'],
    DELETE: ['删除档案', '移除用户', '删除分类'],
    EXPORT: ['导出档案数据', '导出实验记录', '导出审计报告'],
    LOGIN: ['登录系统', '登录成功'],
    LOGOUT: ['登出系统'],
    CONFIG: ['修改系统设置', '更新权限配置', '调整参数']
  }
  const ips = ['192.168.1.101', '192.168.1.102', '10.0.0.55', '172.16.0.8', '192.168.1.105']
  const targets = ['档案ID: ARC-2024001', '用户: 陈晓雨', '品系: C57BL/6', '权限配置', '系统参数']
  
  const logs = []
  const startDate = new Date(2025, 0, 10)
  const endDate = new Date(2025, 0, 20)
  
  for (let i = 1; i <= 156; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const actionContentList = actionContents[action]
    const content = actionContentList[Math.floor(Math.random() * actionContentList.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const status = Math.random() > 0.95 ? 'fail' : 'success'
    
    logs.push({
      id: i,
      time: randomDate,
      userName: user.name,
      role: user.role,
      employeeId: user.employeeId,
      action: action,
      content: content,
      target: Math.random() > 0.6 ? targets[Math.floor(Math.random() * targets.length)] : null,
      ip: ips[Math.floor(Math.random() * ips.length)],
      status: status,
      detail: status === 'success' ? { affectedRows: Math.floor(Math.random() * 5) + 1 } : { errorCode: 'ERR_001', reason: '权限不足' },
      errorMsg: status === 'fail' ? '操作失败：权限验证不通过' : null
    })
  }
  
  // 按时间倒序排序
  logs.sort((a, b) => b.time - a.time)
  return logs
}

const allLogs = ref(generateMockLogs())

// 筛选条件
const searchKeyword = ref('')
const filterRole = ref('all')
const filterAction = ref('all')
const dateStart = ref('')
const dateEnd = ref('')
const currentPage = ref(1)
const pageSize = 12

// 统计
const totalCount = computed(() => allLogs.value.length)
const todayCount = computed(() => {
  const today = new Date().toDateString()
  return allLogs.value.filter(l => new Date(l.time).toDateString() === today).length
})
const thisWeekCount = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return allLogs.value.filter(l => new Date(l.time) >= weekStart).length
})
const userCount = computed(() => {
  return new Set(allLogs.value.map(l => l.userName)).size
})

// 筛选后的日志
const filteredLogs = computed(() => {
  let result = [...allLogs.value]
  
  // 搜索关键词
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(l =>
      l.userName.toLowerCase().includes(kw) ||
      l.content.toLowerCase().includes(kw) ||
      l.ip.includes(kw)
    )
  }
  
  // 角色筛选
  if (filterRole.value !== 'all') {
    result = result.filter(l => l.role === filterRole.value)
  }
  
  // 操作类型筛选
  if (filterAction.value !== 'all') {
    result = result.filter(l => l.action === filterAction.value)
  }
  
  // 日期范围筛选
  if (dateStart.value) {
    const start = new Date(dateStart.value)
    start.setHours(0, 0, 0, 0)
    result = result.filter(l => new Date(l.time) >= start)
  }
  if (dateEnd.value) {
    const end = new Date(dateEnd.value)
    end.setHours(23, 59, 59, 999)
    result = result.filter(l => new Date(l.time) <= end)
  }
  
  return result
})

// 分页
const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize))
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredLogs.value.slice(start, end)
})

// 辅助函数
const getRoleLabel = (role) => {
  const labels = { experimenter: '实验人员', auditor: '审计员', admin: '管理员' }
  return labels[role] || role
}

const getRoleClass = (role) => {
  return { experimenter: 'role-experimenter', auditor: 'role-auditor', admin: 'role-admin' }[role]
}

const getActionClass = (action) => {
  const classes = {
    CREATE: 'action-create',
    UPDATE: 'action-update',
    DELETE: 'action-delete',
    EXPORT: 'action-export',
    LOGIN: 'action-login',
    LOGOUT: 'action-logout',
    CONFIG: 'action-config'
  }
  return classes[action] || ''
}

const getAvatarColor = (role) => {
  const colors = { experimenter: '#e0f2e9', auditor: '#fff0e0', admin: '#ffe8e6' }
  return colors[role] || '#e8f0fe'
}

const getInitials = (name) => {
  return name.charAt(0)
}

const formatDateTime = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 操作方法
const resetFilters = () => {
  searchKeyword.value = ''
  filterRole.value = 'all'
  filterAction.value = 'all'
  dateStart.value = ''
  dateEnd.value = ''
  currentPage.value = 1
}

const refreshLogs = () => {
  allLogs.value = generateMockLogs()
  resetFilters()
}

const exportLogs = () => {
  const data = filteredLogs.value.map(l => ({
    时间: formatDateTime(l.time),
    操作人: l.userName,
    角色: getRoleLabel(l.role),
    操作类型: l.action,
    操作内容: l.content,
    IP地址: l.ip,
    状态: l.status === 'success' ? '成功' : '失败'
  }))
  console.log('导出日志:', data)
  alert(`导出 ${data.length} 条日志记录`)
}

// 详情模态框
const detailModalVisible = ref(false)
const selectedLog = ref(null)

const viewDetail = (log) => {
  selectedLog.value = log
  detailModalVisible.value = true
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedLog.value = null
}

// 监听筛选变化重置页码
import { watch } from 'vue'
watch([searchKeyword, filterRole, filterAction, dateStart, dateEnd], () => {
  currentPage.value = 1
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.operation-log-container {
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

.header-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-export, .btn-refresh {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-export {
  background: #f1f5f9;
  color: #2c5f4a;
  border: 1px solid #e2e8f0;
}

.btn-export:hover {
  background: #e6edf4;
}

.btn-refresh {
  background: #e0f2e9;
  color: #1f7840;
}

.btn-refresh:hover {
  background: #c8e6d9;
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

/* 筛选栏 */
.filter-bar {
  background: white;
  border-radius: 1rem;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  border: 1px solid #edf2f7;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
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
  padding: 0.6rem 0.7rem 0.6rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.search-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
}

.filter-select {
  padding: 0.6rem 1.5rem 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  outline: none;
}

.range-sep {
  color: #8ba0b5;
}

.btn-reset {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: #5e7a93;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-reset:hover {
  background: #e6edf4;
}

/* 表格 */
.table-wrapper {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  overflow-x: auto;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  min-width: 1000px;
}

.log-table th {
  text-align: left;
  padding: 1rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  color: #2c4b3e;
}

.log-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f0f3f9;
  color: #2d3e50;
  vertical-align: middle;
}

.log-table tr:hover td {
  background: #fafefb;
}

.time-cell {
  white-space: nowrap;
  font-family: monospace;
  font-size: 0.75rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2c4b3e;
}

.content-cell .log-content {
  display: block;
}

.log-target {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.ip-cell {
  font-family: monospace;
  font-size: 0.75rem;
}

/* 徽章样式 */
.role-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.role-experimenter { background: #e0f2e9; color: #1f7840; }
.role-auditor { background: #fff0e0; color: #c26b2e; }
.role-admin { background: #ffe8e6; color: #bc4e2c; }

.action-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.action-create { background: #e0f2e9; color: #1f7840; }
.action-update { background: #e8f0fe; color: #4a6fa5; }
.action-delete { background: #ffe8e6; color: #bc4e2c; }
.action-export { background: #f0e8fe; color: #7c5e9a; }
.action-login { background: #e0f2e9; color: #1f7840; }
.action-logout { background: #f1f5f9; color: #5e7a93; }
.action-config { background: #fff0e0; color: #c26b2e; }

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-success { background: #e0f2e9; color: #1f7840; }
.status-fail { background: #ffe8e6; color: #bc4e2c; }

.detail-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  color: #2c5f4a;
}

.detail-btn:hover {
  background: #eef6f2;
  border-color: #2c9a6e;
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
  max-width: 600px;
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
  padding: 1rem 1.5rem;
  border-top: 1px solid #eef2f6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b85a0;
  text-transform: uppercase;
}

.detail-item span {
  font-size: 0.85rem;
  color: #1e293b;
  word-break: break-word;
}

.detail-json {
  background: #f5f7fb;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  overflow-x: auto;
}

.error-text {
  color: #bc4e2c;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: #2c5f4a;
  cursor: pointer;
}

/* 响应式 */
@media (max-width: 768px) {
  .operation-log-container {
    padding: 1rem;
  }
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  .date-range {
    justify-content: flex-start;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>