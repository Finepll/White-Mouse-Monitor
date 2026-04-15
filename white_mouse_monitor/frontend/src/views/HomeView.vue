<template>
  <div class="dashboard-container">
    <!-- 顶部欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-left">
        <div class="avatar">
          <img src="https://via.placeholder.com/60" alt="头像" />
        </div>
        <div class="welcome-text">
          <h2>下午好，欢迎登录</h2>
          <p>一站式小鼠实验智能监测平台，助你轻松管理设备、实时监控行为、精准分析数据</p>
        </div>
      </div>
      <div class="banner-right">
        <img src="https://via.placeholder.com/400x150" alt="插画" />
      </div>
    </div>

    <!-- 今日核心指标 -->
    <div class="core-indicators">
      <div class="indicator-card">
        <div class="label">今日 UV</div>
        <div class="value">67</div>
        <div class="trend up">
          <span>环比上周 8.63%</span>
          <i class="el-icon top"></i>
        </div>
      </div>
      <div class="indicator-card">
        <div class="label">昨日 UV</div>
        <div class="value">569</div>
        <div class="trend up">
          <span>同比上周 14.07%</span>
          <i class="el-icon top"></i>
        </div>
      </div>
      <div class="indicator-card">
        <div class="label">新用户</div>
        <div class="value">45</div>
        <div class="trend down">
          <span>同比上周 23.35%</span>
          <i class="el-icon down"></i>
        </div>
      </div>
      <div class="indicator-card">
        <div class="label">近7日 UV</div>
        <div class="value">366</div>
      </div>
      <div class="indicator-card">
        <div class="label">近30日 UV</div>
        <div class="value">5639</div>
      </div>
      <div class="date-label">2021-08-01</div>
    </div>

    <!-- 流量统计 -->
    <div class="flow-stats">
      <div class="flow-total">
        <div class="label">总流量(人为)</div>
        <div class="value">601,986,875</div>
      </div>
      <div class="flow-item">
        <div class="flow-header">
          <span>付费流量</span>
        </div>
        <div class="flow-content">
          <el-progress
            type="circle"
            :percentage="61"
            :stroke-width="8"
            color="#409eff"
            :width="60"
          />
          <div class="flow-info">
            <div class="flow-value">370,221,928</div>
            <div class="flow-rate">占比61.55%</div>
          </div>
        </div>
      </div>
      <div class="flow-item">
        <div class="flow-header">
          <span>免费流量</span>
        </div>
        <div class="flow-content">
          <el-progress
            type="circle"
            :percentage="30"
            :stroke-width="8"
            color="#67c23a"
            :width="60"
          />
          <div class="flow-info">
            <div class="flow-value">180,596,062</div>
            <div class="flow-rate">占比30%</div>
          </div>
        </div>
      </div>
      <div class="flow-item">
        <div class="flow-header">
          <span>其他流量</span>
        </div>
        <div class="flow-content">
          <el-progress
            type="circle"
            :percentage="9"
            :stroke-width="8"
            color="#dcdfe6"
            :width="60"
          />
          <div class="flow-info">
            <div class="flow-value">51,168,884</div>
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
          <span>月数据趋势</span>
        </div>
        <div class="chart-content">
          <div class="chart-meta">
            <div class="meta-item">
              <span class="meta-label">支付成功率</span>
              <span class="meta-value">45.82%</span>
            </div>
            <div class="meta-trend">
              <span class="trend-item up">周同比 ▲ 6.47%</span>
              <span class="trend-item down">月同比 ▼ 6.67%</span>
            </div>
            <div class="meta-target">参考线 55%</div>
          </div>
          <div id="monthlyChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 排查代办提示 -->
      <div class="todo-card">
        <div class="card-header">
          <span>排查代办提示</span>
        </div>
        <div class="todo-list">
          <div class="todo-item">
            <div class="todo-avatar">
              <img src="https://via.placeholder.com/32" alt="代办人" />
            </div>
            <div class="todo-content">
              <div class="todo-title">未出单数高于往期，明确指出流程</div>
              <div class="todo-time">自 2021-08-01</div>
            </div>
          </div>
          <div class="todo-item">
            <div class="todo-avatar">
              <img src="https://via.placeholder.com/32" alt="代办人" />
            </div>
            <div class="todo-content">
              <div class="todo-title">支付率急剧下降，请排查</div>
              <div class="todo-time">自 2021-08-01</div>
            </div>
          </div>
        </div>
        <div class="alert-card">
          <div class="alert-header">预警提示</div>
          <div class="alert-content">
            <span>同期未出单数高出上月同比</span>
            <span class="alert-value">10.23%</span>
          </div>
        </div>
      </div>

      <!-- 产品销售好评度 -->
      <div class="rate-card">
        <div class="card-header">
          <span>产品销售好评度</span>
        </div>
        <div class="rate-list">
          <div class="rate-item">
            <div class="rate-name">图马思特</div>
            <el-progress :percentage="82" :show-text="false" color="#409eff" />
            <span class="rate-value">82%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">FANATEC</div>
            <el-progress :percentage="83" :show-text="false" color="#409eff" />
            <span class="rate-value">83%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">HORI</div>
            <el-progress :percentage="83" :show-text="false" color="#409eff" />
            <span class="rate-value">83%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">Logitech</div>
            <el-progress :percentage="82" :show-text="false" color="#409eff" />
            <span class="rate-value">82%</span>
          </div>
          <div class="rate-item">
            <div class="rate-name">PNN莱仕达</div>
            <el-progress :percentage="83" :show-text="false" color="#409eff" />
            <span class="rate-value">83%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-section">
      <div class="member-card">
        <div class="card-header">
          <span>成员管理</span>
        </div>
        <el-table :data="memberList" style="width:100%">
          <el-table-column prop="name" label="成员名称"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="statusText" label="状态"></el-table-column>
        </el-table>
      </div>

      <div class="right-stats">
        <div class="stat-card">
          <span>今日待订单</span>
          <h3>736</h3>
        </div>
        <div class="stat-card">
          <span>未完成待办</span>
          <h3>12</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const memberList = ref([
  { name: '申荣', email: 'test@qq.com', statusText: '正常' },
  { name: '占叶', email: 'test@qq.com', statusText: '正常' },
  { name: '豆城圆', email: 'test@qq.com', statusText: '异常' },
])

onMounted(() => {
  const chartDom = document.getElementById('monthlyChart')
  const myChart = echarts.init(chartDom)
  const option = {
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'] },
    yAxis: { type: 'value' },
    series: [{ data: [30, 28, 32, 35, 40, 45, 50, 55], type: 'bar', itemStyle: { color: '#409eff' } }]
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
  background: #f5f7fa;
  box-sizing: border-box;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #409eff 0%, #722ed1 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
}

.core-indicators {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.indicator-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.indicator-card .label {
  font-size: 14px;
  color: #666;
}

.indicator-card .value {
  font-size: 26px;
  font-weight: bold;
  margin: 8px 0;
}

.trend.up {
  color: #f56c6c;
}

.trend.down {
  color: #67c23a;
}

.flow-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.flow-total, .flow-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.flow-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.middle-section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card, .todo-card, .rate-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.chart-container {
  width: 100%;
  height: 200px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.todo-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.rate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bottom-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.member-card, .stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.stat-card {
  margin-bottom: 16px;
}
</style>