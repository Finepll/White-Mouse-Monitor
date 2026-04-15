<template>
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
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

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
)

export default {
  name: 'HealthLineChart',
  components: { Line },
  props: {
    timeRange: {
      type: String,
      default: 'Year'
    }
  },
  computed: {
    chartData() {
      const labels =
        this.timeRange === 'Year'
          ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          : ['Week 1', 'Week 2', 'Week 3', 'Week 4']

      const data =
        this.timeRange === 'Year'
          ? [65, 59, 80, 81, 56, 55, 40, 72, 68, 75, 60, 90]
          : [60, 70, 65, 85]

      return {
        labels,
        datasets: [
          {
            label: 'Health Index',
            data,
            fill: true,
            tension: 0.4, // ✅ 曲线平滑度
            borderColor: '#4ECDC4',
            backgroundColor: 'rgba(78, 205, 196, 0.2)',
            pointBackgroundColor: '#4ECDC4',
            pointBorderColor: '#fff',
            pointRadius: 4
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  height: 140px;
}
</style>