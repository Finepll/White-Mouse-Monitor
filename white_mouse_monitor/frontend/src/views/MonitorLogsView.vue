<template>
  <div class="log-monitor-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📊 日志监控</h1>
        <div class="sub">系统运行日志 · 实时监控与历史追溯</div>
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
      <div class="stat-card-mini" :class="{ active: filterLevel === 'all' }" @click="setLevelFilter('all')">
        <div class="stat-number-mini">{{ totalCount }}</div>
        <div class="stat-label-mini">全部</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterLevel === 'error' }" @click="setLevelFilter('error')">
        <div class="stat-number-mini">{{ errorCount }}</div>
        <div class="stat-label-mini">错误</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterLevel === 'warning' }" @click="setLevelFilter('warning')">
        <div class="stat-number-mini">{{ warningCount }}</div>
        <div class="stat-label-mini">警告</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterLevel === 'info' }" @click="setLevelFilter('info')">
        <div class="stat-number-mini">{{ infoCount }}</div>
        <div class="stat-label-mini">信息</div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="search-card">
      <div class="search-title">
        <span class="title-icon">🔍</span>
        <span>日志查询</span>
      </div>
      <div class="search-form">
        <div class="form-row">
          <div class="form-group flex-2">
            <label>关键词搜索</label>
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                v-model="searchKeyword"
                class="search-input"
                placeholder="搜索日志内容、模块、用户..."
              />
            </div>
          </div>
          <div class="form-group">
            <label>日志级别</label>
            <select v-model="filterLevel" class="form-select">
              <option value="all">全部级别</option>
              <option value="error">错误</option>
              <option value="warning">警告</option>
              <option value="info">信息</option>
            </select>
          </div>
          <div class="form-group">
            <label>模块筛选</label>
            <select v-model="filterModule" class="form-select">
              <option value="all">全部模块</option>
              <option value="system">系统</option>
              <option value="database">数据库</option>
              <option value="auth">认证</option>
              <option value="api">API</option>
              <option value="stream">直播流</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>日期范围</label>
            <div class="date-range">
              <input type="date" v-model="dateStart" class="date-input" />
              <span class="range-sep">至</span>
              <input type="date" v-model="dateEnd" class="date-input" />
            </div>
          </div>
          <div class="form-group">
            <label>时间段</label>
            <div class="time-range">
              <select v-model="timeStart" class="time-select">
                <option v-for="h in 24" :key="h-1" :value="`${String(h-1).padStart(2,'0')}:00`">
                  {{ String(h-1).padStart(2,'0') }}:00
                </option>
              </select>
              <span class="range-sep">至</span>
              <select v-model="timeEnd" class="time-select">
                <option v-for="h in 24" :key="h" :value="`${String(h).padStart(2,'0')}:00`">
                  {{ String(h).padStart(2,'0') }}:00
                </option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-search" @click="searchLogs">
              <span class="search-icon">🔍</span> 查询
            </button>
            <button class="btn-reset" @click="resetSearch">
              <span class="reset-icon">⟳</span> 显示全部
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-section">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span>日志列表</span>
        <span class="result-count">共 {{ displayedLogs.length }} 条日志</span>
        <div class="auto-refresh">
          <label class="checkbox-label">
            <input type="checkbox" v-model="autoRefresh" />
            <span>自动刷新 (5s)</span>
          </label>
        </div>
      </div>

      <div v-if="displayedLogs.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无日志记录</p>
      </div>

      <div v-else class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>级别</th>
              <th>模块</th>
              <th>内容</th>
              <th>来源</th>
              <th>详情</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.id" :class="`level-${log.level}`">
              <td class="time-cell">{{ formatDateTime(log.time) }}</td>
              <td>
                <span class="level-badge" :class="`level-${log.level}`">
                  {{ getLevelLabel(log.level) }}
                </span>
              </td>
              <td>
                <span class="module-badge">{{ log.module }}</span>
              </td>
              <td class="content-cell">
                <span class="log-message">{{ log.message }}</span>
                <div class="log-detail" v-if="log.detail">{{ log.detail }}</div>
              </td>
              <td class="source-cell">{{ log.source || 'system' }}</td>
              <td>
                <button class="detail-btn" @click="viewDetail(log)">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
              <label>时间</label>
              <span>{{ formatDateTime(selectedLog.time) }}</span>
            </div>
            <div class="detail-item">
              <label>级别</label>
              <span class="level-badge" :class="`level-${selectedLog.level}`">
                {{ getLevelLabel(selectedLog.level) }}
              </span>
            </div>
            <div class="detail-item">
              <label>模块</label>
              <span>{{ selectedLog.module }}</span>
            </div>
            <div class="detail-item">
              <label>来源IP</label>
              <span>{{ selectedLog.source || 'system' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>内容</label>
              <span>{{ selectedLog.message }}</span>
            </div>
            <div class="detail-item full-width" v-if="selectedLog.detail">
              <label>详细信息</label>
              <pre class="detail-json">{{ selectedLog.detail }}</pre>
            </div>
            <div class="detail-item full-width" v-if="selectedLog.stack">
              <label>堆栈信息</label>
              <pre class="detail-stack">{{ selectedLog.stack }}</pre>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 模拟日志数据
const generateMockLogs = () => {
  const modules = ['system', 'database', 'auth', 'api', 'stream']
  const levels = ['info', 'warning', 'error']
  const messages = {
    info: [
      '用户登录成功', '服务启动完成', '配置加载成功', '数据同步完成', 
      'API请求正常', '直播流连接成功', '录像回放开始'
    ],
    warning: [
      '磁盘使用率超过80%', 'API响应缓慢', '连接池使用率偏高', 
      '内存使用率告警', '直播流重连', '认证超时'
    ],
    error: [
      '数据库连接失败', 'API请求超时', '认证失败', '文件写入错误',
      '直播流断开', '录像加载失败', '权限验证失败'
    ]
  }
  
  const logs = []
  const startDate = new Date(2025, 0, 15)
  const endDate = new Date(2025, 0, 20)
  
  for (let i = 1; i <= 98; i++) {
    const module = modules[Math.floor(Math.random() * modules.length)]
    let level
    if (i % 10 === 0) level = 'error'
    else if (i % 7 === 0) level = 'warning'
    else level = 'info'
    
    const messageList = messages[level]
    const message = messageList[Math.floor(Math.random() * messageList.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    
    const log = {
      id: i,
      time: randomDate,
      level: level,
      module: module,
      message: message,
      source: `192.168.1.${Math.floor(Math.random() * 255)}`,
      detail: level === 'error' ? `错误详情: ${message}，错误码: ERR_${String(i).padStart(4, '0')}` : null,
      stack: level === 'error' ? `at LogService.handle (log.js:42:15)\nat main.js:23:10` : null
    }
    logs.push(log)
  }
  
  // 按时间倒序排序
  logs.sort((a, b) => b.time - a.time)
  return logs
}

const allLogs = ref(generateMockLogs())

// 筛选条件
const searchKeyword = ref('')
const filterLevel = ref('all')
const filterModule = ref('all')
const dateStart = ref('')
const dateEnd = ref('')
const timeStart = ref('00:00')
const timeEnd = ref('23:00')
const autoRefresh = ref(false)

// 显示的日志（初始显示全部）
const displayedLogs = ref([...allLogs.value])

// 统计数据
const totalCount = computed(() => allLogs.value.length)
const errorCount = computed(() => allLogs.value.filter(l => l.level === 'error').length)
const warningCount = computed(() => allLogs.value.filter(l => l.level === 'warning').length)
const infoCount = computed(() => allLogs.value.filter(l => l.level === 'info').length)

// 分页
const currentPage = ref(1)
const pageSize = 15
const totalPages = computed(() => Math.ceil(displayedLogs.value.length / pageSize))
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return displayedLogs.value.slice(start, end)
})

// 详情模态框
const detailModalVisible = ref(false)
const selectedLog = ref(null)

// 自动刷新定时器
let refreshTimer = null

// 辅助函数
const getLevelLabel = (level) => {
  const labels = { error: '错误', warning: '警告', info: '信息' }
  return labels[level] || level
}

const formatDateTime = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 设置级别筛选
const setLevelFilter = (level) => {
  filterLevel.value = level
  searchLogs()
}

// 查询日志
const searchLogs = () => {
  let results = [...allLogs.value]
  
  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    results = results.filter(l =>
      l.message.toLowerCase().includes(kw) ||
      l.module.toLowerCase().includes(kw) ||
      (l.detail && l.detail.toLowerCase().includes(kw))
    )
  }
  
  // 级别筛选
  if (filterLevel.value !== 'all') {
    results = results.filter(l => l.level === filterLevel.value)
  }
  
  // 模块筛选
  if (filterModule.value !== 'all') {
    results = results.filter(l => l.module === filterModule.value)
  }
  
  // 日期范围筛选
  if (dateStart.value) {
    const start = new Date(dateStart.value)
    start.setHours(0, 0, 0, 0)
    results = results.filter(l => new Date(l.time) >= start)
  }
  if (dateEnd.value) {
    const end = new Date(dateEnd.value)
    end.setHours(23, 59, 59, 999)
    results = results.filter(l => new Date(l.time) <= end)
  }
  
  // 时间段筛选
  const startHour = parseInt(timeStart.value.split(':')[0])
  const endHour = parseInt(timeEnd.value.split(':')[0])
  results = results.filter(l => {
    const hour = new Date(l.time).getHours()
    return hour >= startHour && hour <= endHour
  })
  
  displayedLogs.value = results
  currentPage.value = 1
}

// 重置查询（显示全部）
const resetSearch = () => {
  searchKeyword.value = ''
  filterLevel.value = 'all'
  filterModule.value = 'all'
  dateStart.value = ''
  dateEnd.value = ''
  timeStart.value = '00:00'
  timeEnd.value = '23:00'
  displayedLogs.value = [...allLogs.value]
  currentPage.value = 1
}

// 刷新日志（模拟新增日志）
const refreshLogs = () => {
  // 模拟新增一条日志
  const newLog = {
    id: Date.now(),
    time: new Date(),
    level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
    module: ['system', 'database', 'auth', 'api', 'stream'][Math.floor(Math.random() * 5)],
    message: `[${new Date().toLocaleTimeString()}] 系统运行中...`,
    source: `192.168.1.${Math.floor(Math.random() * 255)}`,
    detail: null
  }
  allLogs.value.unshift(newLog)
  
  // 如果当前没有筛选条件，更新显示列表
  if (searchKeyword.value === '' && filterLevel.value === 'all' && filterModule.value === 'all' && 
      !dateStart.value && !dateEnd.value && timeStart.value === '00:00' && timeEnd.value === '23:00') {
    displayedLogs.value.unshift(newLog)
  } else {
    // 有筛选条件时，重新查询
    searchLogs()
  }
}

// 导出日志
const exportLogs = () => {
  const data = displayedLogs.value.map(l => ({
    时间: formatDateTime(l.time),
    级别: getLevelLabel(l.level),
    模块: l.module,
    内容: l.message,
    来源: l.source,
    详情: l.detail || ''
  }))
  console.log('导出日志:', data)
  alert(`导出 ${data.length} 条日志记录`)
}

// 查看详情
const viewDetail = (log) => {
  selectedLog.value = log
  detailModalVisible.value = true
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedLog.value = null
}

// 自动刷新逻辑
const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      refreshLogs()
    }
  }, 5000)
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 监听自动刷新开关
import { watch } from 'vue'
watch(autoRefresh, (newVal) => {
  if (newVal) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
})

// 监听筛选变化重置页码
watch([searchKeyword, filterLevel, filterModule, dateStart, dateEnd, timeStart, timeEnd], () => {
  currentPage.value = 1
})

// 组件挂载
onMounted(() => {
  // 初始显示全部日志
  displayedLogs.value = [...allLogs.value]
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.log-monitor-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: transparent;
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #2c5f4a;
  border: 1px solid #e2e8f0;
}

.btn-export:hover {
  background: white;
}

.btn-refresh {
  background: rgba(224, 242, 233, 0.9);
  backdrop-filter: blur(4px);
  color: #1f7840;
  border: 1px solid #c8e6d9;
}

.btn-refresh:hover {
  background: #e0f2e9;
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-card-mini {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  min-width: 100px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card-mini:hover {
  transform: translateY(-1px);
  background: white;
}

.stat-card-mini.active {
  border-color: #2c9a6e;
  background: rgba(44, 154, 110, 0.1);
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

/* 查询卡片 */
.search-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
  background: rgba(250, 252, 255, 0.8);
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c4b3e;
}

.search-form {
  padding: 1.2rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

.form-group.flex-2 {
  flex: 2;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding: 0.6rem 0.7rem 0.6rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.search-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
}

.form-select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.date-range, .time-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input, .time-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.time-select {
  width: 90px;
}

.range-sep {
  color: #8ba0b5;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  align-items: flex-end;
}

.btn-search, .btn-reset {
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
}

.btn-search {
  background: #1f5e4a;
  color: white;
}

.btn-search:hover {
  background: #164b3b;
}

.btn-reset {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #5e7a93;
}

.btn-reset:hover {
  background: #e6edf4;
}

/* 日志列表区域 */
.logs-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
  background: rgba(250, 252, 255, 0.8);
  border-bottom: 1px solid #eef2f8;
}

.section-icon {
  font-size: 1rem;
}

.section-header span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c4b3e;
}

.result-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: #8ba0b5;
  font-weight: normal;
}

.auto-refresh {
  margin-left: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #5e7a93;
  cursor: pointer;
}

/* 日志表格 */
.logs-table-wrapper {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  min-width: 900px;
}

.logs-table th {
  text-align: left;
  padding: 0.8rem 1rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  color: #2c4b3e;
}

.logs-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f0f3f9;
  color: #2d3e50;
  vertical-align: middle;
}

.logs-table tr:hover td {
  background: rgba(250, 254, 251, 0.8);
}

.logs-table tr.level-error td {
  background: rgba(188, 78, 44, 0.05);
}

.logs-table tr.level-warning td {
  background: rgba(194, 107, 46, 0.05);
}

.time-cell {
  font-family: monospace;
  font-size: 0.7rem;
  white-space: nowrap;
}

.content-cell .log-message {
  display: block;
}

.log-detail {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.source-cell {
  font-family: monospace;
  font-size: 0.7rem;
}

/* 徽章样式 */
.level-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 500;
}

.level-badge.level-error {
  background: #ffe8e6;
  color: #bc4e2c;
}

.level-badge.level-warning {
  background: #fff0e0;
  color: #c26b2e;
}

.level-badge.level-info {
  background: #e0f2e9;
  color: #1f7840;
}

.module-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem;
  background: #f1f5f9;
  color: #5e7a93;
}

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
  background: rgba(255, 255, 255, 0.8);
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
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state p {
  color: #8ba0b5;
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
  max-width: 650px;
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

.detail-item span, .detail-item pre {
  font-size: 0.85rem;
  color: #1e293b;
  word-break: break-word;
}

.detail-json, .detail-stack {
  background: #f5f7fb;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.7rem;
  overflow-x: auto;
  font-family: monospace;
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
@media (max-width: 900px) {
  .log-monitor-container {
    padding: 1rem;
  }
  .form-row {
    flex-direction: column;
  }
  .form-actions {
    justify-content: flex-start;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-item.full-width {
    grid-column: span 1;
  }
  .stats-row {
    justify-content: space-around;
  }
  .section-header {
    flex-wrap: wrap;
  }
  .auto-refresh {
    margin-left: auto;
  }
}
</style>