<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)

onMounted(() => {
  const chart = echarts.init(chartRef.value)

  chart.setOption({
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [12, 15, 10, 18, 14, 20],
        type: 'line',
        smooth: true
      }
    ]
  })

  window.addEventListener('resize', () => {
    chart.resize()
  })
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 260px;
}
</style>