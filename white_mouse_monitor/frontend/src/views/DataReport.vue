<template>
  <div class="data-report-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📊 数据报表</h1>
        <div class="sub">小鼠监控数据统计 · 多维度分析与报表导出</div>
      </div>
      <div class="header-actions">
        <button class="btn-export" @click="exportReport">
          <span class="export-icon">📎</span> 导出报表
        </button>
        <button class="btn-refresh" @click="refreshData">
          <span class="refresh-icon">⟳</span> 刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalRecords }}</div>
        <div class="stat-label-mini">总记录数</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalCameras }}</div>
        <div class="stat-label-mini">监控设备</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalMice }}</div>
        <div class="stat-label-mini">监测小鼠</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ avgDuration }}</div>
        <div class="stat-label-mini">平均时长(min)</div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="search-card">
      <div class="search-title">
        <span class="title-icon">🔍</span>
        <span>报表查询</span>
      </div>
      <div class="search-form">
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
            <label>摄像头设备</label>
            <select v-model="filterCamera" class="form-select">
              <option value="all">全部摄像头</option>
              <option v-for="cam in cameras" :key="cam.id" :value="cam.id">
                {{ cam.name }} ({{ cam.location }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>小鼠编号</label>
            <input
              type="text"
              v-model="filterMouseCode"
              class="form-input"
              placeholder="输入小鼠编号搜索"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>排序方式</label>
            <div class="sort-buttons">
              <button
                v-for="sort in sortOptions"
                :key="sort.value"
                class="sort-btn"
                :class="{ active: sortBy === sort.value }"
                @click="setSort(sort.value)"
              >
                {{ sort.label }}
                <span v-if="sortBy === sort.value" class="sort-arrow">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <div class="form-actions">
              <button class="btn-search" @click="searchReports">
                <span class="search-icon">🔍</span> 查询
              </button>
              <button class="btn-reset" @click="resetSearch">
                <span class="reset-icon">⟳</span> 显示全部
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 报表列表 -->
    <div class="reports-section">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span>监控数据报表</span>
        <span class="result-count">共 {{ displayedReports.length }} 条记录</span>
      </div>

      <div v-if="displayedReports.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无数据记录</p>
      </div>

      <div v-else class="reports-grid">
        <div
          v-for="report in paginatedReports"
          :key="report.id"
          class="report-card"
          @click="viewDetail(report)"
        >
          <div class="report-header">
            <div class="report-title">
              <span class="mouse-icon">🐭</span>
              <span class="mouse-code">{{ report.mouseCode }}</span>
            </div>
            <div class="report-date">{{ formatDate(report.date) }}</div>
          </div>
          <div class="report-body">
            <div class="report-info">
              <div class="info-row">
                <span class="info-label">摄像头</span>
                <span class="info-value">{{ report.cameraName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">时间段</span>
                <span class="info-value">{{ report.startTime }} - {{ report.endTime }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">时长</span>
                <span class="info-value duration">{{ report.duration }} 分钟</span>
              </div>
              <div class="info-row">
                <span class="info-label">活动次数</span>
                <span class="info-value">{{ report.activityCount }} 次</span>
              </div>
            </div>
            <div class="report-preview">
              <div class="preview-placeholder">
                <span class="preview-icon">🎥</span>
                <span class="preview-text">点击查看回放</span>
              </div>
            </div>
          </div>
          <div class="report-footer">
            <span class="status-badge" :class="getStatusClass(report.status)">
              {{ report.status }}
            </span>
            <span class="record-time">记录时间: {{ formatDateTime(report.recordTime) }}</span>
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

    <!-- 详情模态框（视频回放集成点） -->
    <div v-if="detailModalVisible" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h3>📹 监控回放</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedReport">
          <div class="detail-info">
            <div class="detail-row">
              <span class="detail-label">小鼠编号:</span>
              <span class="detail-value">{{ selectedReport.mouseCode }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">摄像头:</span>
              <span class="detail-value">{{ selectedReport.cameraName }} ({{ selectedReport.cameraLocation }})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">时间段:</span>
              <span class="detail-value">{{ selectedReport.startTime }} - {{ selectedReport.endTime }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">日期:</span>
              <span class="detail-value">{{ selectedReport.date }}</span>
            </div>
          </div>
          
          <!-- 视频播放器区域 - 萤石开放平台回放集成位置 -->
          <div class="video-player-container">
            <div id="ezuikit-player-detail" class="ezuikit-player" ref="playerContainer">
              <div v-if="!isPlayerReady" class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>正在加载录像...</p>
              </div>
              <div v-if="playerError" class="error-overlay">
                <span class="error-icon">⚠️</span>
                <p>录像加载失败，请检查网络</p>
                <button class="retry-btn" @click="loadPlayback">重试</button>
              </div>
            </div>
            <div class="player-controls" v-if="isPlayerReady">
              <button class="control-btn" @click="togglePlayback">
                {{ isPlaying ? '⏸️' : '▶️' }}
              </button>
              <button class="control-btn" @click="toggleMute">
                {{ isMuted ? '🔇' : '🔊' }}
              </button>
              <div class="progress-bar" ref="progressBar" @click="seekTo">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <span class="time-display">{{ currentTime }} / {{ totalTime }}</span>
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

// 摄像头设备列表
const cameras = ref([
  { id: 'cam_001', name: 'A区摄像头', location: '实验楼A栋 3F', deviceSerial: 'E12345678' },
  { id: 'cam_002', name: 'B区摄像头', location: '实验楼B栋 2F', deviceSerial: 'E87654321' },
  { id: 'cam_003', name: 'C区摄像头', location: '实验楼C栋 1F', deviceSerial: 'E11223344' },
  { id: 'cam_004', name: 'D区摄像头', location: '实验楼A栋 5F', deviceSerial: 'E55667788' }
])

// 模拟数据报表
const generateMockReports = () => {
  const mouseCodes = ['M-001', 'M-002', 'M-003', 'M-004', 'M-005', 'M-006', 'M-007', 'M-008']
  const statuses = ['正常', '活跃', '安静', '异常']
  const reports = []
  const startDate = new Date(2025, 0, 10)
  const endDate = new Date(2025, 0, 20)
  
  for (let i = 1; i <= 56; i++) {
    const camera = cameras.value[Math.floor(Math.random() * cameras.value.length)]
    const mouseCode = mouseCodes[Math.floor(Math.random() * mouseCodes.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const dateStr = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`
    const startHour = Math.floor(Math.random() * 23)
    const endHour = startHour + 1
    const duration = Math.floor(Math.random() * 60) + 15
    const activityCount = Math.floor(Math.random() * 20) + 1
    
    reports.push({
      id: i,
      mouseCode: mouseCode,
      cameraId: camera.id,
      cameraName: camera.name,
      cameraLocation: camera.location,
      deviceSerial: camera.deviceSerial,
      date: dateStr,
      startTime: `${String(startHour).padStart(2, '0')}:00:00`,
      endTime: `${String(endHour).padStart(2, '0')}:00:00`,
      duration: duration,
      activityCount: activityCount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      recordTime: randomDate,
      beginTimestamp: randomDate.getTime() + startHour * 3600000,
      endTimestamp: randomDate.getTime() + endHour * 3600000
    })
  }
  
  // 按日期倒序排序
  reports.sort((a, b) => new Date(b.date) - new Date(a.date))
  return reports
}

const allReports = ref(generateMockReports())

// 筛选条件
const dateStart = ref('')
const dateEnd = ref('')
const filterCamera = ref('all')
const filterMouseCode = ref('')

// 排序
const sortOptions = [
  { value: 'date', label: '日期' },
  { value: 'mouseCode', label: '小鼠编号' },
  { value: 'duration', label: '时长' },
  { value: 'activityCount', label: '活动次数' }
]
const sortBy = ref('date')
const sortOrder = ref('desc')

// 显示的报表
const displayedReports = ref([])

// 统计数据
const totalRecords = computed(() => allReports.value.length)
const totalCameras = computed(() => cameras.value.length)
const totalMice = computed(() => {
  return new Set(allReports.value.map(r => r.mouseCode)).size
})
const avgDuration = computed(() => {
  if (allReports.value.length === 0) return 0
  const sum = allReports.value.reduce((s, r) => s + r.duration, 0)
  return Math.round(sum / allReports.value.length)
})

// 分页
const currentPage = ref(1)
const pageSize = 9
const totalPages = computed(() => Math.ceil(displayedReports.value.length / pageSize))
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return displayedReports.value.slice(start, end)
})

// 详情模态框
const detailModalVisible = ref(false)
const selectedReport = ref(null)

// 播放器状态
const isPlayerReady = ref(false)
const playerError = ref(false)
const isPlaying = ref(true)
const isMuted = ref(false)
const currentTime = ref('00:00')
const totalTime = ref('00:00')
const progressPercent = ref(0)

// DOM 引用
const playerContainer = ref(null)
const progressBar = ref(null)
let playTimer = null

// 排序函数
const applySort = (reports) => {
  const sorted = [...reports]
  const order = sortOrder.value === 'asc' ? 1 : -1
  
  sorted.sort((a, b) => {
    let valA, valB
    switch (sortBy.value) {
      case 'date':
        valA = new Date(a.date)
        valB = new Date(b.date)
        break
      case 'mouseCode':
        valA = a.mouseCode
        valB = b.mouseCode
        return order * valA.localeCompare(valB)
      case 'duration':
        valA = a.duration
        valB = b.duration
        break
      case 'activityCount':
        valA = a.activityCount
        valB = b.activityCount
        break
      default:
        return 0
    }
    if (valA < valB) return -order
    if (valA > valB) return order
    return 0
  })
  return sorted
}

// 设置排序
const setSort = (value) => {
  if (sortBy.value === value) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = value
    sortOrder.value = 'desc'
  }
  applyFilters()
}

// 查询报表
const applyFilters = () => {
  let results = [...allReports.value]
  
  // 日期范围筛选
  if (dateStart.value) {
    results = results.filter(r => r.date >= dateStart.value)
  }
  if (dateEnd.value) {
    results = results.filter(r => r.date <= dateEnd.value)
  }
  
  // 摄像头筛选
  if (filterCamera.value !== 'all') {
    results = results.filter(r => r.cameraId === filterCamera.value)
  }
  
  // 小鼠编号筛选
  if (filterMouseCode.value.trim()) {
    const kw = filterMouseCode.value.trim().toLowerCase()
    results = results.filter(r => r.mouseCode.toLowerCase().includes(kw))
  }
  
  // 应用排序
  displayedReports.value = applySort(results)
  currentPage.value = 1
}

const searchReports = () => {
  applyFilters()
}

const resetSearch = () => {
  dateStart.value = ''
  dateEnd.value = ''
  filterCamera.value = 'all'
  filterMouseCode.value = ''
  displayedReports.value = applySort([...allReports.value])
  currentPage.value = 1
}

// 刷新数据
const refreshData = () => {
  allReports.value = generateMockReports()
  resetSearch()
}

// 导出报表
const exportReport = () => {
  const data = displayedReports.value.map(r => ({
    日期: r.date,
    小鼠编号: r.mouseCode,
    摄像头: r.cameraName,
    开始时间: r.startTime,
    结束时间: r.endTime,
    时长_分钟: r.duration,
    活动次数: r.activityCount,
    状态: r.status
  }))
  console.log('导出报表:', data)
  alert(`导出 ${data.length} 条报表记录`)
}

// 查看详情并加载回放
const viewDetail = (report) => {
  selectedReport.value = report
  detailModalVisible.value = true
  loadPlayback()
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedReport.value = null
  stopPlayTimer()
  isPlayerReady.value = false
  playerError.value = false
}

// 加载录像回放（萤石开放平台集成点）
const loadPlayback = () => {
  if (!selectedReport.value) return
  
  isPlayerReady.value = false
  playerError.value = false
  progressPercent.value = 0
  currentTime.value = '00:00'
  
  // 模拟加载过程（实际使用时替换为萤石SDK调用）
  setTimeout(() => {
    isPlayerReady.value = true
    isPlaying.value = true
    totalTime.value = formatTime(selectedReport.value.duration * 60)
    startPlayTimer()
    
    // 实际集成示例代码（取消注释并使用真实配置）:
    /*
    const { EZUIKit } = window
    if (EZUIKit && selectedReport.value) {
      if (window.playerInstance) {
        window.playerInstance.destroy()
      }
      window.playerInstance = new EZUIKit.EZUIKitPlayer({
        id: 'ezuikit-player-detail',
        accessToken: 'YOUR_ACCESS_TOKEN',
        url: `ezopen://${selectedReport.value.deviceSerial}/1?begin=${selectedReport.value.beginTimestamp}&end=${selectedReport.value.endTimestamp}&type=1`,
        width: '100%',
        height: '100%',
        handleSuccess: () => {
          isPlayerReady.value = true
        },
        handleError: (error) => {
          console.error('回放连接失败:', error)
          playerError.value = true
        }
      })
    } else {
      // 模拟演示
      isPlayerReady.value = true
    }
    */
  }, 1000)
}

// 播放控制
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayTimer()
  } else {
    stopPlayTimer()
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const seekTo = (e) => {
  if (!progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  progressPercent.value = Math.min(100, Math.max(0, percent * 100))
  currentTime.value = formatTime((progressPercent.value / 100) * (selectedReport.value?.duration * 60 || 0))
}

const startPlayTimer = () => {
  if (playTimer) clearInterval(playTimer)
  playTimer = setInterval(() => {
    if (isPlaying.value && progressPercent.value < 100) {
      progressPercent.value += 0.5
      currentTime.value = formatTime((progressPercent.value / 100) * (selectedReport.value?.duration * 60 || 0))
    } else if (progressPercent.value >= 100) {
      isPlaying.value = false
      stopPlayTimer()
    }
  }, 500)
}

const stopPlayTimer = () => {
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

// 辅助函数
const formatDate = (dateStr) => {
  return dateStr
}

const formatDateTime = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getStatusClass = (status) => {
  const classes = {
    '正常': 'status-normal',
    '活跃': 'status-active',
    '安静': 'status-quiet',
    '异常': 'status-abnormal'
  }
  return classes[status] || 'status-normal'
}

// 监听筛选变化重置页码
import { watch } from 'vue'
watch([dateStart, dateEnd, filterCamera, filterMouseCode, sortBy, sortOrder], () => {
  if (searchPerformedManually) return
  applyFilters()
})

let searchPerformedManually = false

// 组件挂载
onMounted(() => {
  displayedReports.value = applySort([...allReports.value])
})

onUnmounted(() => {
  stopPlayTimer()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.data-report-container {
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

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.form-input:focus {
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

.sort-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-btn {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  background: white;
  color: #5e7a93;
}

.sort-btn.active {
  background: #1f5e4a;
  border-color: #1f5e4a;
  color: white;
}

.sort-arrow {
  margin-left: 0.2rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
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

/* 报表列表区域 */
.reports-section {
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

/* 报表卡片网格 */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.report-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #edf2f7;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: #fafcff;
  border-bottom: 1px solid #f0f3f9;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mouse-icon {
  font-size: 1rem;
}

.mouse-code {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.report-date {
  font-size: 0.75rem;
  color: #8ba0b5;
  font-family: monospace;
}

.report-body {
  display: flex;
  padding: 0.8rem 1rem;
  gap: 1rem;
}

.report-info {
  flex: 2;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-size: 0.75rem;
}

.info-label {
  color: #8ba0b5;
}

.info-value {
  color: #2d3e50;
  font-weight: 500;
}

.info-value.duration {
  color: #2c9a6e;
}

.report-preview {
  flex: 1;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
}

.preview-placeholder {
  text-align: center;
}

.preview-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.2rem;
}

.preview-text {
  font-size: 0.6rem;
  color: #8ba0b5;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: #fafcff;
  border-top: 1px solid #f0f3f9;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 500;
}

.status-normal {
  background: #e0f2e9;
  color: #1f7840;
}
.status-active {
  background: #e0e7ff;
  color: #4f46e5;
}
.status-quiet {
  background: #f1f5f9;
  color: #5e7a93;
}
.status-abnormal {
  background: #fee2e2;
  color: #dc2626;
}

.record-time {
  font-size: 0.65rem;
  color: #8ba0b5;
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
  background: rgba(0, 0, 0, 0.5);
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
  max-width: 900px;
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

.detail-info {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 80px;
  color: #8ba0b5;
}

.detail-value {
  flex: 1;
  color: #1e293b;
  font-weight: 500;
}

.video-player-container {
  background: #1a1a2e;
  border-radius: 0.75rem;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.ezuikit-player {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0f0f1a;
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #2c9a6e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background: #2c9a6e;
  border: none;
  border-radius: 40px;
  color: white;
  cursor: pointer;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.6);
}

.control-btn {
  background: rgba(0, 0, 0, 0.6);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.9rem;
  cursor: pointer;
  color: white;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #2c9a6e;
  border-radius: 2px;
  width: 0%;
}

.time-display {
  font-size: 0.7rem;
  color: white;
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
  .data-report-container {
    padding: 1rem;
  }
  .form-row {
    flex-direction: column;
  }
  .reports-grid {
    grid-template-columns: 1fr;
  }
  .report-body {
    flex-direction: column;
  }
  .report-preview {
    min-height: 60px;
  }
}
</style>