<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-left">
        <div class="avatar">
          <div class="avatar-icon">🐭</div>
        </div>
        <div class="welcome-text">
          <h2>小白鼠监测管理系统</h2>
          <p>实时监测小鼠健康数据、实验进度、异常预警，助力科研高效精准</p >
        </div>
      </div>
      <div class="banner-right">
        <div class="banner-illustration">
          <span>🐭</span>
          <span>🔬</span>
          <span>📊</span>
        </div>
      </div>
    </div>

    <!-- 今日核心指标 -->
    <div class="core-indicators">
      <div class="indicator-card">
        <div class="label">今日监测数</div>
        <div class="value">67</div>
        <div class="trend up">
          <span>环比昨日 8.63%</span>
        </div>
      </div>
      <div class="indicator-card">
        <div class="label">活跃小鼠</div>
        <div class="value">142</div>
        <div class="trend up">
          <span>同比昨日 14.07%</span>
        </div>
      </div>
      <div class="indicator-card">
        <div class="label">异常警告</div>
        <div class="value">5</div>
        <div class="trend down">
          <span>同比昨日 23.35%</span>
        </div>
      </div>
      <div class="indicator-card">
        <div class="label">近7日监测</div>
        <div class="value">366</div>
      </div>
      <div class="indicator-card">
        <div class="label">近30日监测</div>
        <div class="value">5,639</div>
      </div>
      <div class="date-label">{{ currentDate }}</div>
    </div>

    <!-- 实验数据统计 -->
    <div class="flow-stats">
      <div class="flow-total">
        <div class="label">总实验数据量</div>
        <div class="value">601,986</div>
      </div>
      <div class="flow-item">
        <div class="flow-header">
          <span>进食量数据</span>
        </div>
        <div class="flow-content">
          <div class="progress-circle">
            <svg viewBox="0 0 80 80" class="circle-chart">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="#409eff" stroke-width="6" 
                      stroke-dasharray="201" stroke-dashoffset="78" transform="rotate(-90 40 40)"/>
            </svg>
            <span class="percentage">61%</span>
          </div>
          <div class="flow-info">
            <div class="flow-value">370,221</div>
            <div class="flow-rate">占比61.55%</div>
          </div>
        </div>
      </div>
      <div class="flow-item">
        <div class="flow-header">
          <span>活跃度数据</span>
        </div>
        <div class="flow-content">
          <div class="progress-circle">
            <svg viewBox="0 0 80 80" class="circle-chart">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="#67c23a" stroke-width="6" 
                      stroke-dasharray="201" stroke-dashoffset="141" transform="rotate(-90 40 40)"/>
            </svg>
            <span class="percentage">30%</span>
          </div>
          <div class="flow-info">
            <div class="flow-value">180,596</div>
            <div class="flow-rate">占比30%</div>
          </div>
        </div>
      </div>
      <div class="flow-item">
        <div class="flow-header">
          <span>其他指标数据</span>
        </div>
        <div class="flow-content">
          <div class="progress-circle">
            <svg viewBox="0 0 80 80" class="circle-chart">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" stroke-width="6"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke="#dcdfe6" stroke-width="6" 
                      stroke-dasharray="201" stroke-dashoffset="184" transform="rotate(-90 40 40)"/>
            </svg>
            <span class="percentage">9%</span>
          </div>
          <div class="flow-info">
            <div class="flow-value">51,169</div>
            <div class="flow-rate">占比8.45%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间三栏 -->
    <div class="middle-section">
      <!-- 月数据趋势 -->
      <div class="chart-card">
        <div class="card-header">
          <span>小鼠活跃度趋势</span>
        </div>
        <div class="chart-content">
          <div class="chart-meta">
            <div class="meta-item">
              <span class="meta-label">平均活跃度</span>
              <span class="meta-value">72.8%</span>
            </div>
            <div class="meta-trend">
              <span class="trend-item up">周同比 ▲ 6.47%</span>
              <span class="trend-item down">月同比 ▼ 6.67%</span>
            </div>
            <div class="meta-target">健康标准线 65%</div>
          </div>
          <div id="monthlyChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 排查代办提示 -->
      <div class="todo-card">
        <div class="card-header">
          <span>异常预警提醒</span>
        </div>
        <div class="todo-list">
          <div class="todo-item">
            <div class="todo-avatar">
              <div class="avatar-icon-small">⚠️</div>
            </div>
            <div class="todo-content">
              <div class="todo-title">小鼠M-023进食量异常偏低</div>
              <div class="todo-time">2小时前</div>
            </div>
          </div>
          <div class="todo-item">
            <div class="todo-avatar">
              <div class="avatar-icon-small">⚠️</div>
            </div>
            <div class="todo-content">
              <div class="todo-title">M-045活跃度急剧下降，请排查</div>
              <div class="todo-time">4小时前</div>
            </div>
          </div>
          <div class="todo-item">
            <div class="todo-avatar">
              <div class="avatar-icon-small">⚠️</div>
            </div>
            <div class="todo-content">
              <div class="todo-title">设备传感器异常，数据采集中断</div>
              <div class="todo-time">6小时前</div>
            </div>
          </div>
        </div>
        <div class="alert-card">
          <div class="alert-header">预警提示</div>
          <div class="alert-content">
            <span>同期异常率高出上月同比</span>
            <span class="alert-value">10.23%</span>
          </div>
        </div>
      </div>

      <!-- 实验品系分布 -->
      <div class="rate-card">
        <div class="card-header">
          <span>小鼠品系分布</span>
        </div>
        <div class="rate-list">
          <div class="rate-item">
            <div class="rate-name">BALB/c</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 35%"></div>
            </div>
            <span class="rate-value">35%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">C57BL/6</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 28%"></div>
            </div>
            <span class="rate-value">28%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">ICR</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 20%"></div>
            </div>
            <span class="rate-value">20%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">KM</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 12%"></div>
            </div>
            <span class="rate-value">12%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">其他</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 5%"></div>
            </div>
            <span class="rate-value">5%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-section">
      <div class="member-card">
        <div class="card-header">
          <span>最近监测记录</span>
        </div>
        <table class="record-table">
          <thead>
            <tr>
              <th>小鼠编号</th>
              <th>进食量(g)</th>
              <th>活跃度(%)</th>
              <th>监测时间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in recentRecords" :key="record.id">
              <td>{{ record.mouseId }}</td>
              <td>{{ record.food }}</td>
              <td>{{ record.active }}</td>
              <td>{{ record.time }}</td>
              <td>
                <span :class="['status-badge', record.status === '正常' ? 'normal' : 'abnormal']">
                  {{ record.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="right-stats">
        <div class="stat-card">
          <span>今日待处理异常</span>
          <h3>5</h3>
          <div class="stat-trend down">较昨日 -2</div>
        </div>
        <div class="stat-card">
          <span>进行中实验</span>
          <h3>12</h3>
          <div class="stat-trend up">较昨日 +3</div>
        </div>
        <div class="stat-card">
          <span>本月完成实验</span>
          <h3>8</h3>
          <div class="stat-trend up">较上月 +2</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const currentDate = ref('')

const recentRecords = ref([
  { id: 1, mouseId: 'M-001', food: 5.2, active: 86, time: '2025-08-15 08:30', status: '正常' },
  { id: 2, mouseId: 'M-002', food: 3.8, active: 72, time: '2025-08-15 08:31', status: '正常' },
  { id: 3, mouseId: 'M-003', food: 2.1, active: 45, time: '2025-08-15 08:32', status: '异常' },
  { id: 4, mouseId: 'M-004', food: 4.5, active: 78, time: '2025-08-15 08:33', status: '正常' },
  { id: 5, mouseId: 'M-005', food: 1.8, active: 38, time: '2025-08-15 08:34', status: '异常' },
])

onMounted(() => {
  // 设置当前日期
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN')
  
  // 初始化图表
  const chartDom = document.getElementById('monthlyChart')
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { 
      type: 'category', 
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
      axisLabel: { fontSize: 11 }
    },
    yAxis: { 
      type: 'value',
      name: '活跃度(%)',
      axisLabel: { fontSize: 11 }
    },
    series: [{ 
      data: [68, 72, 70, 75, 78, 82, 85, 88], 
      type: 'line', 
      smooth: true,
      lineStyle: { color: '#409eff', width: 3 },
      areaStyle: { opacity: 0.1, color: '#409eff' },
      itemStyle: { color: '#409eff' }
    }],
    grid: { top: 30, bottom: 20, left: 45, right: 20, containLabel: true }
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: transparent;
  box-sizing: border-box;
  overflow-x: auto;
}

/* 欢迎横幅 */
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e2a3a 0%, #0d9488 100%);
  border-radius: 12px;
  padding: 20px 24px;
  color: white;
  margin-bottom: 20px;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.welcome-text h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
}

.welcome-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.banner-illustration {
  display: flex;
  gap: 12px;
  font-size: 40px;
}

/* 核心指标 */
.core-indicators {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.indicator-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.indicator-card .label {
  font-size: 13px;
  color: #8a9bb0;
}

.indicator-card .value {
  font-size: 26px;
  font-weight: bold;
  margin: 8px 0;
  color: #1e2a3a;
}

.trend {
  font-size: 12px;
}

.trend.up {
  color: #f56c6c;
}

.trend.down {
  color: #67c23a;
}

.date-label {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 13px;
  color: #8a9bb0;
}

/* 实验数据统计 */
.flow-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.flow-total, .flow-item {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.flow-total .label {
  font-size: 13px;
  color: #8a9bb0;
}

.flow-total .value {
  font-size: 28px;
  font-weight: bold;
  color: #1e2a3a;
  margin-top: 8px;
}

.flow-content {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-circle {
  position: relative;
  width: 70px;
  height: 70px;
}

.circle-chart {
  width: 100%;
  height: 100%;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
}

.flow-info {
  flex: 1;
}

.flow-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e2a3a;
}

.flow-rate {
  font-size: 12px;
  color: #8a9bb0;
}

/* 中间区域 */
.middle-section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card, .todo-card, .rate-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  font-weight: 600;
  color: #1e2a3a;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.chart-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 12px;
}

.meta-value {
  font-weight: bold;
  font-size: 18px;
  color: #409eff;
}

.meta-trend {
  display: flex;
  gap: 12px;
}

.trend-item.up {
  color: #f56c6c;
}

.trend-item.down {
  color: #67c23a;
}

.chart-container {
  width: 100%;
  height: 200px;
}

/* 待办列表 */
.todo-list {
  max-height: 200px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-icon-small {
  width: 32px;
  height: 32px;
  background: #fef3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.todo-time {
  font-size: 11px;
  color: #999;
}

/* 预警卡片 */
.alert-card {
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 8px;
}

.alert-header {
  font-size: 12px;
  color: #d97706;
  margin-bottom: 4px;
}

.alert-content {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.alert-value {
  font-weight: bold;
  color: #d97706;
}

/* 品系分布 */
.rate-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.rate-name {
  width: 70px;
  font-size: 13px;
  color: #333;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  border-radius: 4px;
}

.rate-value {
  width: 40px;
  font-size: 13px;
  text-align: right;
  color: #409eff;
}

/* 底部区域 */
.bottom-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.member-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.record-table {
  width: 100%;
  border-collapse: collapse;
}

.record-table th,
.record-table td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.record-table th {
  background: #f8f9fa;
  font-weight: 500;
  color: #666;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.status-badge.normal {
  background: #e6f7e6;
  color: #2e7d32;
}

.status-badge.abnormal {
  background: #ffebee;
  color: #c62828;
}

.right-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-card span {
  font-size: 13px;
  color: #8a9bb0;
}

.stat-card h3 {
  font-size: 32px;
  margin: 8px 0;
  color: #1e2a3a;
}

.stat-trend {
  font-size: 12px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

/* 响应式 */
@media (max-width: 1200px) {
  .core-indicators {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .middle-section {
    grid-template-columns: 1fr;
  }
  
  .bottom-section {
    grid-template-columns: 1fr;
  }
}
</style>