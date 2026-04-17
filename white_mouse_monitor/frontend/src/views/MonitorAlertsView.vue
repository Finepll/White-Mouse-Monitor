<template>
  <div class="alert-monitor-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>⚠️ 告警记录</h1>
        <div class="sub">系统告警事件记录 · 实时监控与快速响应</div>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportAlerts">
          <span class="export-icon">📎</span> 导出告警
        </button>
        <button class="btn-refresh" @click="refreshAlerts">
          <span class="refresh-icon">⟳</span> 刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini" :class="{ active: filterSeverity === 'all' }" @click="setSeverityFilter('all')">
        <div class="stat-number-mini">{{ totalCount }}</div>
        <div class="stat-label-mini">全部</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterSeverity === 'critical' }" @click="setSeverityFilter('critical')">
        <div class="stat-number-mini">{{ criticalCount }}</div>
        <div class="stat-label-mini">紧急</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterSeverity === 'high' }" @click="setSeverityFilter('high')">
        <div class="stat-number-mini">{{ highCount }}</div>
        <div class="stat-label-mini">严重</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterSeverity === 'medium' }" @click="setSeverityFilter('medium')">
        <div class="stat-number-mini">{{ mediumCount }}</div>
        <div class="stat-label-mini">中等</div>
      </div>
      <div class="stat-card-mini" :class="{ active: filterSeverity === 'low' }" @click="setSeverityFilter('low')">
        <div class="stat-number-mini">{{ lowCount }}</div>
        <div class="stat-label-mini">轻微</div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="search-card">
      <div class="search-title">
        <span class="title-icon">🔍</span>
        <span>告警查询</span>
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
                placeholder="搜索告警内容、来源、设备..."
              />
            </div>
          </div>
          <div class="form-group">
            <label>告警级别</label>
            <select v-model="filterSeverity" class="form-select">
              <option value="all">全部级别</option>
              <option value="critical">紧急</option>
              <option value="high">严重</option>
              <option value="medium">中等</option>
              <option value="low">轻微</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="filterStatus" class="form-select">
              <option value="all">全部状态</option>
              <option value="active">未处理</option>
              <option value="acknowledged">已确认</option>
              <option value="resolved">已解决</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>来源模块</label>
            <select v-model="filterSource" class="form-select">
              <option value="all">全部来源</option>
              <option value="camera">摄像头</option>
              <option value="stream">直播流</option>
              <option value="storage">存储</option>
              <option value="database">数据库</option>
              <option value="auth">认证</option>
              <option value="system">系统</option>
            </select>
          </div>
          <div class="form-group">
            <label>日期范围</label>
            <div class="date-range">
              <input type="date" v-model="dateStart" class="date-input" />
              <span class="range-sep">至</span>
              <input type="date" v-model="dateEnd" class="date-input" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-search" @click="searchAlerts">
              <span class="search-icon">🔍</span> 查询
            </button>
            <button class="btn-reset" @click="resetSearch">
              <span class="reset-icon">⟳</span> 显示全部
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 告警列表 -->
    <div class="alerts-section">
      <div class="section-header">
        <span class="section-icon">🚨</span>
        <span>告警列表</span>
        <span class="result-count">共 {{ displayedAlerts.length }} 条告警</span>
        <div class="auto-refresh">
          <label class="checkbox-label">
            <input type="checkbox" v-model="autoRefresh" />
            <span>自动刷新 (10s)</span>
          </label>
        </div>
      </div>

      <div v-if="displayedAlerts.length === 0" class="empty-state">
        <div class="empty-icon">✅</div>
        <p>暂无告警记录，系统运行正常</p>
      </div>

      <div v-else class="alerts-list">
        <div
          v-for="alert in paginatedAlerts"
          :key="alert.id"
          class="alert-card"
          :class="[`severity-${alert.severity}`, `status-${alert.status}`]"
        >
          <div class="alert-header">
            <div class="alert-left">
              <span class="severity-badge" :class="`severity-${alert.severity}`">
                {{ getSeverityLabel(alert.severity) }}
              </span>
              <span class="alert-title">{{ alert.title }}</span>
            </div>
            <div class="alert-right">
              <span class="alert-time">{{ formatDateTime(alert.time) }}</span>
              <div class="alert-actions">
                <button
                  v-if="alert.status === 'active'"
                  class="action-btn acknowledge-btn"
                  @click="acknowledgeAlert(alert)"
                  title="确认告警"
                >
                  ✓
                </button>
                <button
                  v-if="alert.status !== 'resolved'"
                  class="action-btn resolve-btn"
                  @click="resolveAlert(alert)"
                  title="标记解决"
                >
                  ✔
                </button>
                <button class="action-btn detail-btn" @click="viewDetail(alert)" title="详情">
                  📋
                </button>
              </div>
            </div>
          </div>
          <div class="alert-body">
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-meta">
              <span class="meta-item">
                <span class="meta-icon">📦</span>
                {{ alert.source }}
              </span>
              <span class="meta-item" v-if="alert.deviceName">
                <span class="meta-icon">📹</span>
                {{ alert.deviceName }}
              </span>
              <span class="meta-item" v-if="alert.ip">
                <span class="meta-icon">🌐</span>
                {{ alert.ip }}
              </span>
              <span class="status-badge" :class="`status-${alert.status}`">
                {{ getStatusLabel(alert.status) }}
              </span>
            </div>
          </div>
          <div class="alert-footer" v-if="alert.resolvedTime && alert.status === 'resolved'">
            <span class="resolved-info">✓ 已解决于 {{ formatDateTime(alert.resolvedTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">←</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">→</button>
      </div>
    </div>

    <!-- 告警详情模态框 -->
    <div v-if="detailModalVisible" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h3>📋 告警详情</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedAlert">
          <div class="detail-grid">
            <div class="detail-item">
              <label>告警级别</label>
              <span class="severity-badge" :class="`severity-${selectedAlert.severity}`">
                {{ getSeverityLabel(selectedAlert.severity) }}
              </span>
            </div>
            <div class="detail-item">
              <label>状态</label>
              <span class="status-badge" :class="`status-${selectedAlert.status}`">
                {{ getStatusLabel(selectedAlert.status) }}
              </span>
            </div>
            <div class="detail-item">
              <label>发生时间</label>
              <span>{{ formatDateTime(selectedAlert.time) }}</span>
            </div>
            <div class="detail-item">
              <label>来源模块</label>
              <span>{{ selectedAlert.source }}</span>
            </div>
            <div class="detail-item" v-if="selectedAlert.deviceName">
              <label>设备名称</label>
              <span>{{ selectedAlert.deviceName }}</span>
            </div>
            <div class="detail-item" v-if="selectedAlert.deviceSerial">
              <label>设备序列号</label>
              <span>{{ selectedAlert.deviceSerial }}</span>
            </div>
            <div class="detail-item full-width">
              <label>告警标题</label>
              <span>{{ selectedAlert.title }}</span>
            </div>
            <div class="detail-item full-width">
              <label>详细内容</label>
              <span>{{ selectedAlert.message }}</span>
            </div>
            <div class="detail-item full-width" v-if="selectedAlert.suggestion">
              <label>处理建议</label>
              <span class="suggestion-text">{{ selectedAlert.suggestion }}</span>
            </div>
            <div class="detail-item full-width" v-if="selectedAlert.resolvedTime">
              <label>解决时间</label>
              <span>{{ formatDateTime(selectedAlert.resolvedTime) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="selectedAlert?.status === 'active'"
            class="btn-primary"
            @click="acknowledgeAlert(selectedAlert); closeDetailModal()"
          >
            确认告警
          </button>
          <button
            v-if="selectedAlert?.status !== 'resolved'"
            class="btn-success"
            @click="resolveAlert(selectedAlert); closeDetailModal()"
          >
            标记解决
          </button>
          <button class="btn-secondary" @click="closeDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 模拟告警数据
const generateMockAlerts = () => {
  const sources = ['camera', 'stream', 'storage', 'database', 'auth', 'system']
  const severities = ['critical', 'high', 'medium', 'low']
  const titles = {
    critical: ['直播流中断', '存储服务不可用', '数据库连接失败', '设备离线'],
    high: ['视频卡顿严重', '磁盘使用率超90%', 'API响应超时', '认证服务异常'],
    medium: ['网络延迟升高', 'CPU使用率偏高', '内存使用率超80%', '录像文件损坏'],
    low: ['设备时间不同步', '配置变更', '登录失败尝试', '带宽使用率偏高']
  }
  const messages = {
    critical: [
      '摄像头直播流已断开超过30秒，请检查网络连接和设备状态',
      '存储服务响应超时，录像可能无法正常保存',
      '数据库连接池耗尽，系统功能可能受限',
      '设备离线超过5分钟，请检查电源和网络'
    ],
    high: [
      '视频流传输延迟超过5秒，建议检查网络带宽',
      '磁盘可用空间不足10%，请及时清理历史数据',
      'API接口响应时间超过3秒，系统负载较高',
      '认证服务响应缓慢，可能影响登录功能'
    ],
    medium: [
      '网络延迟超过100ms，可能影响直播观看体验',
      '系统CPU使用率持续高于80%，建议排查异常进程',
      '内存使用率超过80%，可能存在内存泄漏',
      '录像文件完整性校验失败，建议重新录制'
    ],
    low: [
      '设备时间与服务器相差超过30秒，建议同步时间',
      '系统配置发生变更，已记录审计日志',
      '用户登录失败，请确认用户名密码',
      '带宽使用率偏高，可能影响其他服务'
    ]
  }
  
  const alerts = []
  const startDate = new Date(2025, 0, 10)
  const endDate = new Date(2025, 0, 20)
  
  for (let i = 1; i <= 42; i++) {
    let severity
    if (i <= 5) severity = 'critical'
    else if (i <= 12) severity = 'high'
    else if (i <= 25) severity = 'medium'
    else severity = 'low'
    
    const source = sources[Math.floor(Math.random() * sources.length)]
    const titleList = titles[severity]
    const messageList = messages[severity]
    const title = titleList[Math.floor(Math.random() * titleList.length)]
    const message = messageList[Math.floor(Math.random() * messageList.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    
    let status
    if (i % 3 === 0) status = 'resolved'
    else if (i % 5 === 0) status = 'acknowledged'
    else status = 'active'
    
    const alert = {
      id: i,
      time: randomDate,
      severity: severity,
      source: source,
      title: title,
      message: message,
      status: status,
      deviceName: source === 'camera' || source === 'stream' ? `摄像头-${String(i % 5 + 1).padStart(2, '0')}` : null,
      deviceSerial: source === 'camera' || source === 'stream' ? `E${Math.floor(Math.random() * 100000000)}` : null,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      suggestion: severity === 'critical' ? '立即检查设备状态和网络连接，必要时重启服务' :
                   severity === 'high' ? '尽快排查问题，避免影响扩大' :
                   severity === 'medium' ? '计划内处理，不影响核心功能' : '可择机处理',
      resolvedTime: status === 'resolved' ? new Date(randomDate.getTime() + Math.random() * 3600000) : null
    }
    alerts.push(alert)
  }
  
  // 按时间倒序排序
  alerts.sort((a, b) => b.time - a.time)
  return alerts
}

const allAlerts = ref(generateMockAlerts())

// 筛选条件
const searchKeyword = ref('')
const filterSeverity = ref('all')
const filterStatus = ref('all')
const filterSource = ref('all')
const dateStart = ref('')
const dateEnd = ref('')
const autoRefresh = ref(false)

// 显示的告警（初始显示全部）
const displayedAlerts = ref([...allAlerts.value])

// 统计数据
const totalCount = computed(() => allAlerts.value.length)
const criticalCount = computed(() => allAlerts.value.filter(a => a.severity === 'critical').length)
const highCount = computed(() => allAlerts.value.filter(a => a.severity === 'high').length)
const mediumCount = computed(() => allAlerts.value.filter(a => a.severity === 'medium').length)
const lowCount = computed(() => allAlerts.value.filter(a => a.severity === 'low').length)

// 分页
const currentPage = ref(1)
const pageSize = 8
const totalPages = computed(() => Math.ceil(displayedAlerts.value.length / pageSize))
const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return displayedAlerts.value.slice(start, end)
})

// 详情模态框
const detailModalVisible = ref(false)
const selectedAlert = ref(null)

// 自动刷新定时器
let refreshTimer = null

// 辅助函数
const getSeverityLabel = (severity) => {
  const labels = { critical: '紧急', high: '严重', medium: '中等', low: '轻微' }
  return labels[severity] || severity
}

const getStatusLabel = (status) => {
  const labels = { active: '未处理', acknowledged: '已确认', resolved: '已解决' }
  return labels[status] || status
}

const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 设置级别筛选
const setSeverityFilter = (severity) => {
  filterSeverity.value = severity
  searchAlerts()
}

// 查询告警
const searchAlerts = () => {
  let results = [...allAlerts.value]
  
  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    results = results.filter(a =>
      a.title.toLowerCase().includes(kw) ||
      a.message.toLowerCase().includes(kw) ||
      a.source.toLowerCase().includes(kw) ||
      (a.deviceName && a.deviceName.toLowerCase().includes(kw))
    )
  }
  
  // 级别筛选
  if (filterSeverity.value !== 'all') {
    results = results.filter(a => a.severity === filterSeverity.value)
  }
  
  // 状态筛选
  if (filterStatus.value !== 'all') {
    results = results.filter(a => a.status === filterStatus.value)
  }
  
  // 来源筛选
  if (filterSource.value !== 'all') {
    results = results.filter(a => a.source === filterSource.value)
  }
  
  // 日期范围筛选
  if (dateStart.value) {
    const start = new Date(dateStart.value)
    start.setHours(0, 0, 0, 0)
    results = results.filter(a => new Date(a.time) >= start)
  }
  if (dateEnd.value) {
    const end = new Date(dateEnd.value)
    end.setHours(23, 59, 59, 999)
    results = results.filter(a => new Date(a.time) <= end)
  }
  
  displayedAlerts.value = results
  currentPage.value = 1
}

// 重置查询（显示全部）
const resetSearch = () => {
  searchKeyword.value = ''
  filterSeverity.value = 'all'
  filterStatus.value = 'all'
  filterSource.value = 'all'
  dateStart.value = ''
  dateEnd.value = ''
  displayedAlerts.value = [...allAlerts.value]
  currentPage.value = 1
}

// 确认告警
const acknowledgeAlert = (alert) => {
  const index = allAlerts.value.findIndex(a => a.id === alert.id)
  if (index !== -1 && allAlerts.value[index].status === 'active') {
    allAlerts.value[index].status = 'acknowledged'
  }
  // 更新显示列表
  searchAlerts()
}

// 解决告警
const resolveAlert = (alert) => {
  const index = allAlerts.value.findIndex(a => a.id === alert.id)
  if (index !== -1 && allAlerts.value[index].status !== 'resolved') {
    allAlerts.value[index].status = 'resolved'
    allAlerts.value[index].resolvedTime = new Date()
  }
  // 更新显示列表
  searchAlerts()
}

// 刷新告警（模拟新增告警）
const refreshAlerts = () => {
  const newAlert = {
    id: Date.now(),
    time: new Date(),
    severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
    source: ['camera', 'stream', 'storage', 'database', 'auth', 'system'][Math.floor(Math.random() * 6)],
    title: `新告警 - ${new Date().toLocaleTimeString()}`,
    message: `系统检测到异常，请及时处理。[时间: ${new Date().toLocaleString()}]`,
    status: 'active',
    deviceName: Math.random() > 0.5 ? `摄像头-${Math.floor(Math.random() * 5) + 1}` : null,
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    suggestion: '请检查相关服务状态'
  }
  allAlerts.value.unshift(newAlert)
  
  // 如果当前没有筛选条件，更新显示列表
  if (searchKeyword.value === '' && filterSeverity.value === 'all' && 
      filterStatus.value === 'all' && filterSource.value === 'all' &&
      !dateStart.value && !dateEnd.value) {
    displayedAlerts.value.unshift(newAlert)
  } else {
    // 有筛选条件时，重新查询
    searchAlerts()
  }
}

// 导出告警
const exportAlerts = () => {
  const data = displayedAlerts.value.map(a => ({
    时间: formatDateTime(a.time),
    级别: getSeverityLabel(a.severity),
    标题: a.title,
    内容: a.message,
    来源: a.source,
    设备: a.deviceName || '',
    状态: getStatusLabel(a.status),
    解决时间: a.resolvedTime ? formatDateTime(a.resolvedTime) : ''
  }))
  console.log('导出告警:', data)
  alert(`导出 ${data.length} 条告警记录`)
}

// 查看详情
const viewDetail = (alert) => {
  selectedAlert.value = alert
  detailModalVisible.value = true
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedAlert.value = null
}

// 自动刷新逻辑
const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      refreshAlerts()
    }
  }, 10000)
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
watch([searchKeyword, filterSeverity, filterStatus, filterSource, dateStart, dateEnd], () => {
  currentPage.value = 1
})

// 组件挂载
onMounted(() => {
  displayedAlerts.value = [...allAlerts.value]
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

.alert-monitor-container {
  max-width: 1400px;
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
  min-width: 80px;
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
  background: white;
  outline: none;
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

/* 告警列表区域 */
.alerts-section {
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

/* 告警卡片列表 */
.alerts-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.alert-card {
  background: white;
  border-radius: 1rem;
  border-left: 4px solid;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.alert-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(2px);
}

.alert-card.severity-critical {
  border-left-color: #dc2626;
}
.alert-card.severity-high {
  border-left-color: #f97316;
}
.alert-card.severity-medium {
  border-left-color: #eab308;
}
.alert-card.severity-low {
  border-left-color: #8ba0b5;
}

.alert-card.status-resolved {
  opacity: 0.7;
  background: #f8fafc;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  background: #fafcff;
  border-bottom: 1px solid #f0f3f9;
}

.alert-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.severity-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
}

.severity-badge.severity-critical {
  background: #fee2e2;
  color: #dc2626;
}
.severity-badge.severity-high {
  background: #ffedd5;
  color: #f97316;
}
.severity-badge.severity-medium {
  background: #fef9c3;
  color: #ca8a04;
}
.severity-badge.severity-low {
  background: #f1f5f9;
  color: #5e7a93;
}

.alert-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.alert-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-time {
  font-size: 0.7rem;
  color: #8ba0b5;
  font-family: monospace;
}

.alert-actions {
  display: flex;
  gap: 0.3rem;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.acknowledge-btn {
  background: #e0f2e9;
  color: #1f7840;
}

.acknowledge-btn:hover {
  background: #c8e6d9;
}

.resolve-btn {
  background: #e0e7ff;
  color: #4f46e5;
}

.resolve-btn:hover {
  background: #c7d2fe;
}

.detail-btn {
  background: #f1f5f9;
  color: #5e7a93;
}

.detail-btn:hover {
  background: #e2e8f0;
}

.alert-body {
  padding: 0.8rem 1rem;
}

.alert-message {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.4;
  margin-bottom: 0.6rem;
}

.alert-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: #8ba0b5;
}

.meta-icon {
  font-size: 0.7rem;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 500;
}

.status-badge.status-active {
  background: #fee2e2;
  color: #dc2626;
}
.status-badge.status-acknowledged {
  background: #ffedd5;
  color: #f97316;
}
.status-badge.status-resolved {
  background: #e0f2e9;
  color: #1f7840;
}

.alert-footer {
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border-top: 1px solid #f0f3f9;
}

.resolved-info {
  font-size: 0.7rem;
  color: #1f7840;
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
  gap: 0.8rem;
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

.suggestion-text {
  background: #f0faf5;
  padding: 0.5rem;
  border-radius: 8px;
  color: #1f5e4a;
}

.btn-primary {
  background: #1f5e4a;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: white;
  cursor: pointer;
}

.btn-success {
  background: #4f46e5;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: white;
  cursor: pointer;
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
  .alert-monitor-container {
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
  .alert-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .alert-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>