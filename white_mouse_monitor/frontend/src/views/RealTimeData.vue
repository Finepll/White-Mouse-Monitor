<template>
  <div class="real-time-monitor-container">
    <div class="page-header">
      <h1>📡 实时数据 · 小鼠行为监测</h1>
      <div class="sub">实时活跃度 / 离群检测 / 进食饮水 · 动态更新</div>
    </div>

    <!-- 统计卡片 + 连接状态 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ onlineDevices }}</div>
        <div class="stat-label-mini">在线设备</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ activeMice }}</div>
        <div class="stat-label-mini">活跃小鼠</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ avgRealTimeActivity }}</div>
        <div class="stat-label-mini">实时活跃度</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ alertCount }}</div>
        <div class="stat-label-mini">实时告警</div>
      </div>
      <div class="stat-card-mini connection-status" :class="{ connected: isConnected }">
        <div class="status-dot"></div>
        <div class="stat-label-mini">{{ isConnected ? '数据连接中' : '连接断开' }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid-wrapper">
      <!-- 左侧：实时活跃度趋势 -->
      <div class="card">
        <div class="card-header">
          <span>🐭 实时活跃度趋势</span>
          <span class="card-sub">最近30秒数据</span>
        </div>
        <div ref="activityRef" class="chart-box"></div>
        <div class="time-tag">数据周期：最近30秒 · 每秒更新</div>
      </div>

      <!-- 右侧：图片 + 实时异常警告 -->
      <div class="right-panel">
        <div class="card">
          <img
            src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/1321ca0fd87546049ec255e8d717053b.png"
            alt="小白鼠"
            class="mouse-img"
          />
        </div>

        <div class="card">
          <div class="card-header">
            <span>⚠️ 实时异常警告</span>
            <span class="card-sub">最新告警</span>
          </div>
          <table class="warn-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>小鼠编号</th>
                <th>异常类型</th>
                <th>阈值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alert in recentAlerts" :key="alert.id">
                <td>{{ alert.time }}</td>
                <td>{{ alert.mouseId }}</td>
                <td>{{ alert.type }}</td>
                <td>{{ alert.threshold }}</td>
              </tr>
              <tr v-if="recentAlerts.length === 0">
                <td colspan="4" class="empty-td">暂无异常记录</td>
              </tr>
            </tbody>
          </table>
          <div class="time-tag">基于实时离群检测算法</div>
        </div>
      </div>

      <!-- 底部两个图表 -->
      <div class="grid-bottom">
        <div class="card">
          <div class="card-header">
            <span>📊 实时离群程度</span>
            <span class="card-sub">当前时刻分布</span>
          </div>
          <div ref="outlierRef" class="chart-box"></div>
          <div class="time-tag">离群 vs 正常 · 实时比例</div>
        </div>

        <div class="card">
          <div class="card-header">
            <span>🍽️ 实时进食饮水</span>
            <span class="card-sub">最近10分钟累计</span>
          </div>
          <div ref="foodRef" class="chart-box"></div>
          <div class="time-tag">每分钟累计次数</div>
        </div>
      </div>
    </div>

    <!-- 查询排序栏 -->
    <div class="query-section">
      <div class="query-header">
        <span class="query-icon">🔍</span>
        <span>实时数据查询与排序</span>
      </div>
      <div class="query-body">
        <div class="query-row">
          <div class="query-group">
            <label>小鼠编号</label>
            <input
              type="text"
              v-model="filterMouseId"
              class="form-input"
              placeholder="输入小鼠编号筛选"
            />
          </div>
          <div class="query-group">
            <label>数据来源</label>
            <select v-model="filterSource" class="form-select">
              <option value="all">全部设备</option>
              <option value="camera_01">A区摄像头</option>
              <option value="camera_02">B区摄像头</option>
              <option value="camera_03">C区摄像头</option>
            </select>
          </div>
          <div class="query-group">
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
        </div>
        <div class="query-actions">
          <button class="btn-search" @click="refreshData">
            <span class="search-icon">⟳</span> 刷新数据
          </button>
          <button class="btn-reset" @click="resetFilters">
            <span class="reset-icon">↺</span> 重置筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 实时数据明细表格 -->
    <div class="data-table-section">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span>实时数据明细</span>
        <span class="result-count">共 {{ filteredData.length }} 条记录</span>
        <span class="update-tag" v-if="lastUpdateTime">最后更新: {{ lastUpdateTime }}</span>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>小鼠编号</th>
              <th>设备</th>
              <th>活跃度</th>
              <th>离群分数</th>
              <th>进食次数</th>
              <th>饮水次数</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedData" :key="item.id">
              <td>{{ formatTime(item.timestamp) }}</td>
              <td>{{ item.mouseId }}</td>
              <td>{{ item.source }}</td>
              <td>
                <div class="progress-bar-cell">
                  <div class="progress-fill" :style="{ width: item.activity + '%', background: getActivityColor(item.activity) }"></div>
                  <span class="progress-value">{{ item.activity }}%</span>
                </div>
              </td>
              <td>
                <span :class="getOutlierClass(item.outlierScore)">{{ item.outlierScore }}</span>
              </td>
              <td>{{ item.feedCount }} 次</td>
              <td>{{ item.drinkCount }} 次</td>
              <td>
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredData.length === 0">
              <td colspan="8" class="empty-td">暂无实时数据</td>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 图表实例
let activityChart = null
let outlierChart = null
let foodChart = null

// DOM 引用
const activityRef = ref(null)
const outlierRef = ref(null)
const foodRef = ref(null)

// 连接状态
const isConnected = ref(true)
let wsInterval = null
let dataInterval = null

// 筛选条件
const filterMouseId = ref('')
const filterSource = ref('all')

// 排序
const sortOptions = [
  { value: 'timestamp', label: '时间' },
  { value: 'mouseId', label: '小鼠编号' },
  { value: 'activity', label: '活跃度' },
  { value: 'outlierScore', label: '离群分数' }
]
const sortBy = ref('timestamp')
const sortOrder = ref('desc')

// 分页
const currentPage = ref(1)
const pageSize = 8

// 实时数据存储
const realTimeData = ref([])
const lastUpdateTime = ref('')

// 统计数据
const onlineDevices = ref(3)
const activeMice = ref(0)
const avgRealTimeActivity = ref(0)
const alertCount = ref(0)

// 告警数据
const recentAlerts = ref([])

// 生成模拟实时数据
const generateRealTimeData = () => {
  const miceIds = ['M-001', 'M-002', 'M-003', 'M-004', 'M-005', 'M-006', 'M-007', 'M-008']
  const sources = ['A区摄像头', 'B区摄像头', 'C区摄像头']
  const now = new Date()
  
  const newData = []
  // 随机生成8-12条实时数据
  const dataCount = Math.floor(Math.random() * 8) + 8
  
  for (let i = 0; i < dataCount; i++) {
    const mouseId = miceIds[Math.floor(Math.random() * miceIds.length)]
    const activity = Math.floor(Math.random() * 100)
    let outlierScore
    let status
    let isAlert = false
    
    if (activity < 30) {
      outlierScore = Math.floor(Math.random() * 40) + 60
      status = '异常'
      isAlert = activity < 20
    } else if (activity < 50) {
      outlierScore = Math.floor(Math.random() * 30) + 30
      status = '安静'
    } else if (activity < 80) {
      outlierScore = Math.floor(Math.random() * 20) + 10
      status = '正常'
    } else {
      outlierScore = Math.floor(Math.random() * 15) + 5
      status = '活跃'
    }
    
    const feedCount = Math.floor(Math.random() * 8) + 1
    const drinkCount = Math.floor(Math.random() * 10) + 2
    
    newData.push({
      id: Date.now() + i,
      mouseId: mouseId,
      source: sources[Math.floor(Math.random() * sources.length)],
      activity: activity,
      outlierScore: outlierScore,
      feedCount: feedCount,
      drinkCount: drinkCount,
      status: status,
      timestamp: new Date(now.getTime() - Math.random() * 60000) // 最近1分钟内
    })
    
    // 生成告警
    if (isAlert) {
      recentAlerts.value.unshift({
        id: Date.now() + i,
        time: new Date().toLocaleTimeString(),
        mouseId: mouseId,
        type: '活跃度过低',
        threshold: '< 20%'
      })
    }
  }
  
  // 限制告警列表最多10条
  if (recentAlerts.value.length > 10) {
    recentAlerts.value = recentAlerts.value.slice(0, 10)
  }
  
  // 按时间排序
  newData.sort((a, b) => b.timestamp - a.timestamp)
  return newData
}

// 更新实时数据
const updateRealTimeData = () => {
  const newData = generateRealTimeData()
  realTimeData.value = newData
  lastUpdateTime.value = new Date().toLocaleTimeString()
  
  // 更新统计数据
  activeMice.value = new Set(realTimeData.value.map(d => d.mouseId)).size
  const avgActivity = realTimeData.value.reduce((sum, d) => sum + d.activity, 0) / realTimeData.value.length
  avgRealTimeActivity.value = Math.round(avgActivity)
  alertCount.value = recentAlerts.value.length
  
  updateCharts()
}

// 筛选后的数据
const filteredData = computed(() => {
  let result = [...realTimeData.value]
  
  if (filterMouseId.value.trim()) {
    const kw = filterMouseId.value.trim().toLowerCase()
    result = result.filter(d => d.mouseId.toLowerCase().includes(kw))
  }
  if (filterSource.value !== 'all') {
    result = result.filter(d => d.source === filterSource.value)
  }
  
  const order = sortOrder.value === 'asc' ? 1 : -1
  result.sort((a, b) => {
    let valA, valB
    switch (sortBy.value) {
      case 'timestamp':
        valA = a.timestamp
        valB = b.timestamp
        break
      case 'mouseId':
        valA = a.mouseId
        valB = b.mouseId
        return order * valA.localeCompare(valB)
      case 'activity':
        valA = a.activity
        valB = b.activity
        break
      case 'outlierScore':
        valA = a.outlierScore
        valB = b.outlierScore
        break
      default:
        return 0
    }
    return order * (valA - valB)
  })
  
  return result
})

// 分页数据
const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredData.value.slice(start, end)
})

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

// 辅助函数
const getActivityColor = (activity) => {
  if (activity >= 70) return '#5b9bff'
  if (activity >= 50) return '#83b4ff'
  if (activity >= 30) return '#ffd591'
  return '#ff9f6e'
}

const getOutlierClass = (score) => {
  if (score > 80) return 'outlier-high'
  if (score > 60) return 'outlier-mid'
  return 'outlier-low'
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

// 排序方法
const setSort = (value) => {
  if (sortBy.value === value) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = value
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
}

const resetFilters = () => {
  filterMouseId.value = ''
  filterSource.value = 'all'
  sortBy.value = 'timestamp'
  sortOrder.value = 'desc'
  currentPage.value = 1
}

const refreshData = () => {
  updateRealTimeData()
}

// 更新图表
const updateCharts = () => {
  const data = realTimeData.value
  if (data.length === 0) return
  
  // 实时活跃度趋势（最近20条）
  const recentData = data.slice(0, 20).reverse()
  const timeLabels = recentData.map(d => formatTime(d.timestamp))
  const activityValues = recentData.map(d => d.activity)
  
  activityChart?.setOption({
    xAxis: { data: timeLabels },
    series: [{ data: activityValues }]
  })
  
  // 离群饼图
  const outlierCount = data.filter(d => d.outlierScore > 60).length
  const normalCount = data.length - outlierCount
  outlierChart?.setOption({
    series: [{
      data: [
        { value: outlierCount, name: '离群', itemStyle: { color: '#ff9f6e' } },
        { value: normalCount, name: '正常', itemStyle: { color: '#83b4ff' } }
      ]
    }]
  })
  
  // 进食饮水柱状图（按设备分组）
  const sourceMap = new Map()
  data.forEach(d => {
    if (!sourceMap.has(d.source)) {
      sourceMap.set(d.source, { feed: 0, drink: 0, count: 0 })
    }
    const entry = sourceMap.get(d.source)
    entry.feed += d.feedCount
    entry.drink += d.drinkCount
    entry.count++
  })
  const sources = Array.from(sourceMap.keys())
  const feedData = sources.map(s => Math.round(sourceMap.get(s).feed / sourceMap.get(s).count))
  
  foodChart?.setOption({
    xAxis: { data: sources },
    series: [{ data: feedData }]
  })
}

// 初始化图表
const initCharts = () => {
  activityChart = echarts.init(activityRef.value)
  activityChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '5%', bottom: '15%', top: '15%' },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 11, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '活跃度 (%)',
      max: 100,
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f0f7ff' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#83b4ff', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(131, 180, 255, 0.2)' },
          { offset: 1, color: 'rgba(131, 180, 255, 0)' }
        ])
      },
      itemStyle: { color: '#5b9bff' }
    }]
  })

  outlierChart = echarts.init(outlierRef.value)
  outlierChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', textStyle: { color: '#666' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: true, color: '#333', fontSize: 11 },
      data: []
    }]
  })

  foodChart = echarts.init(foodRef.value)
  foodChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: '15%', right: '5%', bottom: '15%', top: '15%' },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 11, rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '平均进食次数',
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f0f7ff' } }
    },
    series: [{
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83b4ff' },
          { offset: 1, color: '#5b9bff' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  })
}

// 模拟WebSocket连接
const startWebSocketSimulation = () => {
  // 初始数据
  updateRealTimeData()
  
  // 每3秒更新一次数据
  dataInterval = setInterval(() => {
    updateRealTimeData()
  }, 3000)
  
  // 模拟连接状态闪烁
  let reconnectAttempts = 0
  wsInterval = setInterval(() => {
    // 模拟偶尔断连重连（演示用）
    if (Math.random() < 0.05 && reconnectAttempts < 3) {
      isConnected.value = false
      reconnectAttempts++
      setTimeout(() => {
        isConnected.value = true
        reconnectAttempts = 0
      }, 2000)
    }
  }, 15000)
}

// 图表自适应
const resizeCharts = () => {
  activityChart?.resize()
  outlierChart?.resize()
  foodChart?.resize()
}

// 组件挂载
onMounted(() => {
  initCharts()
  startWebSocketSimulation()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  if (dataInterval) clearInterval(dataInterval)
  if (wsInterval) clearInterval(wsInterval)
  window.removeEventListener('resize', resizeCharts)
  activityChart?.dispose()
  outlierChart?.dispose()
  foodChart?.dispose()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.real-time-monitor-container {
  background: transparent;
  min-height: 100vh;
  padding: 25px;
  color: #333;
}

/* 页面头部 */
.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
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

.connection-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dc2626;
  animation: pulse 1.5s infinite;
}

.connection-status.connected .status-dot {
  background: #2c9a6e;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 图表区域 */
.grid-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  border: 1px solid rgba(131, 180, 255, 0.15);
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(131, 180, 255, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #5b9bff;
}

.card-header::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #83b4ff;
  border-radius: 2px;
  margin-right: 10px;
}

.card-header span:first-child {
  display: flex;
  align-items: center;
}

.card-sub {
  font-size: 12px;
  font-weight: normal;
  color: #8ba0b5;
}

.chart-box {
  width: 100%;
  height: 220px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.mouse-img {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(131, 180, 255, 0.15);
}

.grid-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  grid-column: 1 / -1;
}

.time-tag {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 警告表格 */
.warn-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.warn-table th {
  background: #f0f7ff;
  color: #5b9bff;
  padding: 10px;
  text-align: center;
}

.warn-table td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #f5f5f5;
  color: #555;
}

.warn-table tr:hover td {
  background: #fafbfc;
}

/* 查询区域 */
.query-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  margin: 1.5rem 0;
  overflow: hidden;
}

.query-header {
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

.query-body {
  padding: 1.2rem;
}

.query-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.query-group {
  flex: 1;
  min-width: 150px;
}

.query-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.form-input:focus, .form-select:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
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
  border: 1px solid #e2e8f0;
  background: white;
  color: #5e7a93;
  transition: all 0.2s;
}

.sort-btn.active {
  background: #1f5e4a;
  border-color: #1f5e4a;
  color: white;
}

.sort-arrow {
  margin-left: 0.2rem;
}

.query-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
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

/* 数据表格 */
.data-table-section {
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
  flex-wrap: wrap;
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
}

.update-tag {
  font-size: 0.7rem;
  color: #2c9a6e;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 800px;
}

.data-table th {
  text-align: left;
  padding: 0.8rem 1rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  color: #2c4b3e;
}

.data-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #f0f3f9;
  color: #2d3e50;
}

.progress-bar-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100px;
}

.progress-fill {
  height: 6px;
  border-radius: 3px;
  background: #83b4ff;
}

.progress-value {
  font-size: 0.7rem;
  color: #666;
  min-width: 35px;
}

.outlier-high {
  color: #dc2626;
  font-weight: 600;
}
.outlier-mid {
  color: #f97316;
}
.outlier-low {
  color: #2c9a6e;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
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

.empty-td {
  text-align: center;
  padding: 2rem;
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

/* 响应式 */
@media (max-width: 1000px) {
  .real-time-monitor-container {
    padding: 15px;
  }
  .grid-wrapper {
    grid-template-columns: 1fr;
  }
  .grid-bottom {
    grid-template-columns: 1fr;
  }
  .query-row {
    flex-direction: column;
  }
  .query-actions {
    justify-content: flex-start;
  }
}
</style>