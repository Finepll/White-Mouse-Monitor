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
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#aaa', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      max: 70,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#aaa', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: [{
      data: [0, 5, 18, 15, 22, 30, 35, 45, 42, 38, 35, 28, 25, 32, 40, 55, 60, 65, 70],
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#409eff', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0)' }
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
      label: { show: true, color: '#fff', fontSize: 11 },
      data: [
        { value: 691, name: '离群', itemStyle: { color: '#409eff' } },
        { value: 136, name: '非离群', itemStyle: { color: '#ff9f43' } }
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
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#aaa', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: 160,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisLabel: { color: '#aaa', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: [{
      type: 'bar',
      data: [50, 48, 85, 145, 120, 80],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#2980b9' }
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.mouse-monitor-container {
  background: linear-gradient(135deg, #283490 0%, #0c143a 50%, #0b2183 100%);
  min-height: 100vh;
  padding: 25px;
  color: #fff;
}

.grid-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

/* 毛玻璃卡片 */
.card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(100, 180, 255, 0.2);
  padding: 20px;
  box-shadow: 0 0 25px rgba(80, 150, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(100, 180, 255, 0.1), transparent);
  transition: left 0.8s ease;
}

.card:hover::before {
  left: 100%;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 35px rgba(80, 150, 255, 0.25);
  border-color: rgba(100, 180, 255, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #64b5ff;
}

.card-header::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #64b5ff, #0088ff);
  border-radius: 2px;
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
  border: 2px solid rgba(100, 180, 255, 0.3);
  box-shadow: 0 0 30px rgba(100, 180, 255, 0.2);
}

/* 底部双图表 */
.grid-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  grid-column: 1 / -1;
}

/* 警告表格 */
.warn-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.warn-table th {
  background: rgba(255, 100, 100, 0.15);
  color: #ff6b6b;
  padding: 10px;
  text-align: center;
  border-radius: 4px;
}

.warn-table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.warn-table tr:hover td {
  background: rgba(255, 100, 100, 0.1);
}

.warn-icon {
  color: #ff6b6b;
  font-weight: bold;
}

.time-tag {
  font-size: 12px;
  color: #888;
  margin-top: 8px;
}
</style>