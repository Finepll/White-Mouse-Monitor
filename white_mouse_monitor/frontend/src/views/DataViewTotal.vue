<template>
  <div class="mouse-monitor-container">
    <div class="page-title"></div>

    <div class="grid-wrapper">
      <!-- 左侧：活跃度趋势 -->
      <div class="card">
        <div class="card-header">小鼠活跃度趋势</div>
        <div ref="activityRef" class="chart-box"></div>
        <div class="time-tag">数据周期：2024.01.01 - 2024.01.31</div>
      </div>

      <!-- 右侧：图片 + 异常警告 -->
      <div class="right-panel">
        <div class="card">
          <img
            src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/1321ca0fd87546049ec255e8d717053b.png"
            alt="小白鼠"
            class="mouse-img"
          />
        </div>

        <div class="card">
          <div class="card-header">异常警告 ⚠️</div>
          <table class="warn-table">
            <thead>
              <tr>
                <th><span class="warn-icon">⚠️</span> 日期</th>
                <th>组号</th>
                <th>区间</th>
                <th>平均时间</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-01-12</td>
                <td>第一部分</td>
                <td>12</td>
                <td>2000-31</td>
              </tr>
              <tr>
                <td>2024-01-16</td>
                <td>第二部分</td>
                <td>16</td>
                <td>2000-31</td>
              </tr>
              <tr>
                <td>2024-01-26</td>
                <td>第一部分</td>
                <td>26</td>
                <td>2000-31</td>
              </tr>
              <tr>
                <td>2024-01-24</td>
                <td>第三部分</td>
                <td>24</td>
                <td>2000-31</td>
              </tr>
            </tbody>
          </table>
          <div class="time-tag">数据周期：2024.01.01 - 2024.01.31</div>
        </div>
      </div>

      <!-- 底部两个图表 -->
      <div class="grid-bottom">
        <div class="card">
          <div class="card-header">离群程度分析</div>
          <div ref="outlierRef" class="chart-box"></div>
          <div class="time-tag">数据周期：2024.01.01 - 2024.01.31</div>
        </div>

        <div class="card">
          <div class="card-header">每日进食次数</div>
          <div ref="foodRef" class="chart-box"></div>
          <div class="time-tag">数据周期：2024.01 - 2024.06</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 图表实例
let activityChart = null
let outlierChart = null
let foodChart = null

// DOM 引用
const activityRef = ref(null)
const outlierRef = ref(null)
const foodRef = ref(null)

// 初始化图表
onMounted(() => {
  // 活跃度趋势
  activityChart = echarts.init(activityRef.value)
  activityChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: '10%', right: '5%', bottom: '15%', top: '15%' },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 31 }, (_, i) => i + 1),
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 70,
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f0f7ff' } }
    },
    series: [{
      data: [0, 5, 18, 15, 22, 30, 35, 45, 42, 38, 35, 28, 25, 32, 40, 55, 60, 65, 70],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#83b4ff', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(131, 180, 255, 0.2)' },
          { offset: 1, color: 'rgba(131, 180, 255, 0)' }
        ])
      }
    }]
  })

  // 离群饼图
  outlierChart = echarts.init(outlierRef.value)
  outlierChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: true, color: '#333', fontSize: 11 },
      data: [
        { value: 691, name: '离群', itemStyle: { color: '#83b4ff' } },
        { value: 136, name: '非离群', itemStyle: { color: '#ffd591' } }
      ]
    }]
  })

  // 进食柱状图
  foodChart = echarts.init(foodRef.value)
  foodChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: '15%', right: '5%', bottom: '15%', top: '15%' },
    xAxis: {
      type: 'category',
      data: ['一月', '二月', '三月', '四月', '五月', '六月'],
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 160,
      axisLine: { lineStyle: { color: '#d1e7ff' } },
      axisLabel: { color: '#666', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f0f7ff' } }
    },
    series: [{
      type: 'bar',
      data: [50, 48, 85, 145, 120, 80],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83b4ff' },
          { offset: 1, color: '#5b9bff' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  })

  // 监听窗口变化
  window.addEventListener('resize', resizeCharts)
})

// 图表自适应
const resizeCharts = () => {
  activityChart?.resize()
  outlierChart?.resize()
  foodChart?.resize()
}

// 销毁
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  activityChart?.dispose()
  outlierChart?.dispose()
  foodChart?.dispose()
})
</script>

<style scoped>
/* 侧边栏本身 - 固定宽度，支持折叠动画 */
.sidebar {
  width: 246px;
  background: rgba(34, 43, 50);
  border-right: 1px solid #0c42a0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
}

/* 折叠状态 */
.sidebar.collapsed {
  width: 64px;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  gap: 12px;
  border-bottom: 1px solid #0dce84;
  flex-shrink: 0;
}

.logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  height: 100%;
}

/* 滚动条样式 - 展开后能看见 */
.nav-menu::-webkit-scrollbar {
  width: 6px;
}
.nav-menu::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 3px;
}
.nav-menu::-webkit-scrollbar-track {
  background: transparent;
}

/* 退出登录按钮样式 */
.logout-btn {
  margin: 8px 16px;
  padding: 8px;
  background: #7e79796f;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 折叠按钮 */
.collapse-btn {
  margin: 16px;
  padding: 8px;
  background: #1e293b;
  border: none;
  color: #9ca3af;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
</style>