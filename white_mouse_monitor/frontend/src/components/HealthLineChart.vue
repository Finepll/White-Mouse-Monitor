<template>
  <!-- 图表容器 -->
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// 注册 Chart.js 模块
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
)

// 接收父组件传来的 timeRange
defineProps({
  timeRange: {
    type: String,
    default: 'Year'
  }
})

// 图表数据
const chartData = {
  labels:
    timeRange === 'Year'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Health Index',
      data: [5, 8, 12, 18, 25, 22, 28, 30, 26, 24, 27, 29],
      borderColor: '#36D7B7',
      backgroundColor: 'rgba(54, 215, 183, 0.15)',
      borderWidth: 3,
      tension: 0.4,     // ✅ 曲线平滑
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#36D7B7'
    }
  ]
}

// 图表配置
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      min: 0,
      max: 35,
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  height: 220px;
}
</style>