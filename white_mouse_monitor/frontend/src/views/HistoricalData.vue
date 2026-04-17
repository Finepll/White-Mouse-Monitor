<template>
  <div class="mouse-monitor-container">
    <div class="page-header">
      <h1>📊 历史数据 · 小鼠行为监测</h1>
      <div class="sub">活跃度 / 离群程度 / 进食饮水 · 多维度数据分析</div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalRecords }}</div>
        <div class="stat-label-mini">总记录数</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalMice }}</div>
        <div class="stat-label-mini">监测小鼠</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ avgActivity }}</div>
        <div class="stat-label-mini">平均活跃度</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ outlierRate }}%</div>
        <div class="stat-label-mini">离群率</div>
      </div>
    </div>

    <!-- 图表区域（放在最上面） -->
    <div class="charts-section">
      <div class="grid-wrapper">
        <!-- 左侧：活跃度趋势 -->
        <div class="card">
          <div class="card-header">
            <span>🐭 小鼠活跃度趋势</span>
            <span class="card-sub">按日期汇总</span>
          </div>
          <div ref="activityRef" class="chart-box"></div>
          <div class="time-tag">数据周期：{{ dateRangeText }}</div>
        </div>

        <!-- 右侧：异常警告 + 图片 -->
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
              <span>⚠️ 异常警告</span>
              <span class="card-sub">离群行为检测</span>
            </div>
            <table class="warn-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>小鼠编号</th>
                  <th>离群分数</th>
                  <th>异常类型</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alert in paginatedAlerts" :key="alert.id">
                  <td>{{ alert.date }}</td>
                  <td>{{ alert.mouseId }}</td>
                  <td>{{ alert.outlierScore }}</td>
                  <td>{{ alert.type }}</td>
                </tr>
                <tr v-if="paginatedAlerts.length === 0">
                  <td colspan="4" class="empty-td">暂无异常记录</td>
                </tr>
              </tbody>
            </table>
            <div class="time-tag">基于离群检测算法</div>
          </div>
        </div>

        <!-- 底部两个图表 -->
        <div class="grid-bottom">
          <div class="card">
            <div class="card-header">
              <span>📊 离群程度分析</span>
              <span class="card-sub">整体分布</span>
            </div>
            <div ref="outlierRef" class="chart-box"></div>
            <div class="time-tag">离群 vs 正常比例</div>
          </div>

          <div class="card">
            <div class="card-header">
              <span>🍽️ 进食饮水次数</span>
              <span class="card-sub">月度统计</span>
            </div>
            <div ref="foodRef" class="chart-box"></div>
            <div class="time-tag">数据周期：{{ dateRangeText }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 查询排序栏（放在图表下方，明细上方） -->
    <div class="query-section">
      <div class="query-header">
        <span class="query-icon">🔍</span>
        <span>查询与排序</span>
      </div>
      <div class="query-body">
        <div class="query-row">
          <div class="query-group">
            <label>日期范围</label>
            <div class="date-range">
              <input type="date" v-model="dateStart" class="date-input" />
              <span class="range-sep">至</span>
              <input type="date" v-model="dateEnd" class="date-input" />
            </div>
          </div>
          <div class="query-group">
            <label>小鼠编号</label>
            <input
              type="text"
              v-model="filterMouseId"
              class="form-input"
              placeholder="输入小鼠编号"
            />
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
          <button class="btn-search" @click="searchData">
            <span class="search-icon">🔍</span> 查询
          </button>
          <button class="btn-reset" @click="resetSearch">
            <span class="reset-icon">⟳</span> 重置
          </button>
        </div>
      </div>
    </div>

    <!-- 数据明细表格 -->
    <div class="data-table-section">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span>行为数据明细</span>
        <span class="result-count">共 {{ displayedData.length }} 条记录</span>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>小鼠编号</th>
              <th>组别</th>
              <th>活跃度</th>
              <th>离群分数</th>
              <th>进食次数</th>
              <th>饮水次数</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedData" :key="item.id">
              <td>{{ item.date }}</td>
              <td>{{ item.mouseId }}</td>
              <td>{{ item.group }}</td>
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
            <tr v-if="paginatedData.length === 0">
              <td colspan="8" class="empty-td">暂无数据</td>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

// 图表实例
let activityChart = null
let outlierChart = null
let foodChart = null

// DOM 引用
const activityRef = ref(null)
const outlierRef = ref(null)
const foodRef = ref(null)

// 筛选条件
const dateStart = ref('')
const dateEnd = ref('')
const filterMouseId = ref('')

// 排序
const sortOptions = [
  { value: 'date', label: '日期' },
  { value: 'mouseId', label: '小鼠编号' },
  { value: 'activity', label: '活跃度' },
  { value: 'outlierScore', label: '离群分数' },
  { value: 'feedCount', label: '进食次数' }
]
const sortBy = ref('date')
const sortOrder = ref('desc')

// 分页
const currentPage = ref(1)
const pageSize = 10

// 模拟历史数据
const generateMockData = () => {
  const miceIds = ['M-001', 'M-002', 'M-003', 'M-004', 'M-005', 'M-006', 'M-007', 'M-008']
  const groups = ['第一部分', '第二部分', '第三部分', '第四部分']
  const statuses = ['正常', '活跃', '安静', '异常']
  const data = []
  const startDate = new Date(2024, 0, 1)
  const endDate = new Date(2024, 0, 31)

  for (let i = 1; i <= 186; i++) {
    const mouseId = miceIds[Math.floor(Math.random() * miceIds.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const dateStr = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`
    
    let activity
    let outlierScore
    let status
    const rand = Math.random()
    if (rand < 0.1) {
      activity = Math.floor(Math.random() * 30) + 10
      outlierScore = Math.floor(Math.random() * 40) + 60
      status = '异常'
    } else if (rand < 0.2) {
      activity = Math.floor(Math.random() * 30) + 30
      outlierScore = Math.floor(Math.random() * 30) + 40
      status = '安静'
    } else if (rand < 0.7) {
      activity = Math.floor(Math.random() * 30) + 50
      outlierScore = Math.floor(Math.random() * 30) + 10
      status = '正常'
    } else {
      activity = Math.floor(Math.random() * 20) + 70
      outlierScore = Math.floor(Math.random() * 20) + 5
      status = '活跃'
    }

    data.push({
      id: i,
      date: dateStr,
      mouseId: mouseId,
      group: groups[Math.floor(Math.random() * groups.length)],
      activity: activity,
      outlierScore: outlierScore,
      feedCount: Math.floor(Math.random() * 15) + 3,
      drinkCount: Math.floor(Math.random() * 20) + 5,
      status: status,
      timestamp: randomDate.getTime()
    })
  }
  
  data.sort((a, b) => b.timestamp - a.timestamp)
  return data
}

const allData = ref(generateMockData())

// 异常告警数据
const generateAlerts = () => {
  return allData.value
    .filter(d => d.outlierScore > 70)
    .slice(0, 20)
    .map(d => ({
      id: d.id,
      date: d.date,
      mouseId: d.mouseId,
      outlierScore: d.outlierScore,
      type: d.outlierScore > 85 ? '严重离群' : (d.outlierScore > 75 ? '中度离群' : '轻度异常')
    }))
}

const alerts = ref(generateAlerts())

// 筛选后的数据
const filteredData = computed(() => {
  let result = [...allData.value]
  
  if (dateStart.value) {
    result = result.filter(d => d.date >= dateStart.value)
  }
  if (dateEnd.value) {
    result = result.filter(d => d.date <= dateEnd.value)
  }
  if (filterMouseId.value.trim()) {
    const kw = filterMouseId.value.trim().toLowerCase()
    result = result.filter(d => d.mouseId.toLowerCase().includes(kw))
  }
  
  const order = sortOrder.value === 'asc' ? 1 : -1
  result.sort((a, b) => {
    let valA, valB
    switch (sortBy.value) {
      case 'date':
        valA = a.date
        valB = b.date
        return order * valA.localeCompare(valB)
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
      case 'feedCount':
        valA = a.feedCount
        valB = b.feedCount
        break
      default:
        return 0
    }
    return order * (valA - valB)
  })
  
  return result
})

const displayedData = computed(() => filteredData.value)

// 统计数据
const totalRecords = computed(() => displayedData.value.length)
const totalMice = computed(() => {
  return new Set(displayedData.value.map(d => d.mouseId)).size
})
const avgActivity = computed(() => {
  if (displayedData.value.length === 0) return 0
  const sum = displayedData.value.reduce((s, d) => s + d.activity, 0)
  return Math.round(sum / displayedData.value.length)
})
const outlierRate = computed(() => {
  if (displayedData.value.length === 0) return 0
  const outlierCount = displayedData.value.filter(d => d.outlierScore > 60).length
  return Math.round(outlierCount / displayedData.value.length * 100)
})

// 分页数据
const totalPages = computed(() => Math.ceil(displayedData.value.length / pageSize))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return displayedData.value.slice(start, end)
})

// 告警分页
const alertPageSize = 5
const paginatedAlerts = computed(() => {
  return alerts.value.slice(0, alertPageSize)
})

// 日期范围文本
const dateRangeText = computed(() => {
  if (dateStart.value && dateEnd.value) return `${dateStart.value} ~ ${dateEnd.value}`
  if (dateStart.value) return `${dateStart.value} 起`
  if (dateEnd.value) return `至 ${dateEnd.value}`
  return '2024.01.01 - 2024.01.31'
})

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

// 查询方法
const searchData = () => {
  currentPage.value = 1
  updateCharts()
}

const resetSearch = () => {
  dateStart.value = ''
  dateEnd.value = ''
  filterMouseId.value = ''
  sortBy.value = 'date'
  sortOrder.value = 'desc'
  currentPage.value = 1
  updateCharts()
}

const setSort = (value) => {
  if (sortBy.value === value) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = value
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
}

// 更新图表数据
const updateCharts = () => {
  const data = displayedData.value
  
  // 按日期汇总活跃度
  const dateMap = new Map()
  data.forEach(d => {
    if (!dateMap.has(d.date)) {
      dateMap.set(d.date, { total: 0, count: 0 })
    }
    const entry = dateMap.get(d.date)
    entry.total += d.activity
    entry.count++
  })
  const sortedDates = Array.from(dateMap.keys()).sort()
  const activityData = sortedDates.map(date => Math.round(dateMap.get(date).total / dateMap.get(date).count))
  
  activityChart?.setOption({
    xAxis: { data: sortedDates.slice(-20) },
    series: [{ data: activityData.slice(-20) }]
  })
  
  // 更新离群饼图
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
  
  // 按月份汇总进食次数
  const monthMap = new Map()
  data.forEach(d => {
    const month = d.date.substring(0, 7)
    if (!monthMap.has(month)) {
      monthMap.set(month, { total: 0, count: 0 })
    }
    const entry = monthMap.get(month)
    entry.total += d.feedCount
    entry.count++
  })
  const sortedMonths = Array.from(monthMap.keys()).sort()
  const feedData = sortedMonths.map(month => Math.round(monthMap.get(month).total / monthMap.get(month).count))
  
  foodChart?.setOption({
    xAxis: { data: sortedMonths },
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
      name: '进食次数',
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
  
  updateCharts()
}

// 图表自适应
const resizeCharts = () => {
  activityChart?.resize()
  outlierChart?.resize()
  foodChart?.resize()
}

// 监听筛选变化
watch([dateStart, dateEnd, filterMouseId, sortBy, sortOrder], () => {
  currentPage.value = 1
  updateCharts()
})

// 组件挂载
onMounted(() => {
  initCharts()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
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

.mouse-monitor-container {
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

/* 图表区域 */
.charts-section {
  margin-bottom: 1.5rem;
}

.grid-wrapper {
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

/* 查询排序区域 */
.query-section {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  margin-bottom: 1.5rem;
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

.query-icon {
  font-size: 1rem;
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
  min-width: 180px;
}

.query-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input, .form-input {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
  width: 100%;
}

.date-input:focus, .form-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
}

.range-sep {
  color: #8ba0b5;
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

.btn-reset:hover {
  background: #e6edf4;
}

/* 数据表格区域 */
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
  .mouse-monitor-container {
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