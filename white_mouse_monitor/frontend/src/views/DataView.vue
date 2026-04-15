<template>
  <div class="dashboard-content">
    <!-- 顶部工具栏 -->
    <div class="top-bar">
      <div class="search-box">
        <i class="icon-search"></i>
        <input type="text" placeholder="Search your symptoms..." />
      </div>
      <div class="time-info">
        <i class="icon-clock"></i>
        <span>14:02 AM Today Nov, 19</span>
      </div>
    </div>

    <!-- 主体内容区：两列布局 -->
    <div class="main-grid">
      <!-- 左侧主内容区 -->
      <div class="main-left">
        <!-- 促销横幅 -->
        <div class="promo-banner">
          <div class="promo-text">
            <h3>Today -10% discount on lung examinations</h3>
            The package price includes: consultation of a pulmonologist, spirography, cardiogram <i class="icon-arrow-right"></i>
          </div>
          <div class="promo-image">
            <img src="@/assets/lungs.png" alt="Lungs" />
          </div>
        </div>

        <!-- 健康统计 -->
        <div class="health-stats">
          <div class="header">
            <h4>Statistics of your health</h4>
            <div class="year-selector">
              <span>2019</span>
              <button @click="toggleYear">▼</button>
            </div>
            <div class="time-toggle">
              <button :class="{ active: timeRange === 'Year' }" @click="timeRange = 'Year'">Year</button>
              <button :class="{ active: timeRange === 'Month' }" @click="timeRange = 'Month'">Month</button>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="line-chart">
              <div class="line" v-for="i in 12" :key="i" :style="{ height: Math.random() * 50 + 20 + 'px', width: '8px', backgroundColor: '#4ECDC4' }"></div>
            </div>
            <div class="chart-label">10th of August (meas. 7 days)</div>
          </div>
        </div>

        <!-- 心率 & 活动 -->
        <div class="cards-row">
          <div class="card heart-rate">
            <div class="title">Heart rate</div>
            <div class="value">112 <small>bpm</small></div>
            <div class="wave">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 L10,5 L20,15 L30,8 L40,12 L50,6 L60,14 L70,9 L80,11 L90,7 L100,10" stroke="#fff" fill="none" stroke-width="2"/>
              </svg>
            </div>
          </div>
          <div class="card activity">
            <div class="header">
              <h4>Your activity</h4>
              <div class="time-toggle">
                <button :class="{ active: activityTime === 'Week' }" @click="activityTime = 'Week'">Week</button>
                <button :class="{ active: activityTime === 'Month' }" @click="activityTime = 'Month'">Month</button>
              </div>
            </div>
            <div class="bar-chart">
              <div class="bar" v-for="(item, i) in activityData" :key="i" :style="{ height: item.height + 'px', backgroundColor: i === 3 ? '#FF5722' : '#E0F2F1' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏内容 -->
      <div class="main-right">
        <!-- 用户信息 -->
        <div class="user-card">
          <div class="user-header">
            <img src="@/assets/user-avatar.png" alt="User" class="avatar" />
            <div class="user-info">
              <strong>Anastasia Turner</strong>
              <small>36 years, Houston</small>
            </div>
            <i class="icon-menu"></i>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="label">Blood</span>
              <span class="value">A+</span>
            </div>
            <div class="stat-item">
              <span class="label">Height</span>
              <span class="value">175 cm</span>
            </div>
            <div class="stat-item">
              <span class="label">Weight</span>
              <span class="value">64 kg</span>
            </div>
            <div class="stat-item">
              <span class="label">Pressure</span>
              <span class="value">120/81</span>
            </div>
          </div>
        </div>

        <!-- 日历 -->
        <div class="calendar">
          <h4>November <button>▼</button></h4>
          <div class="days">
            <span v-for="day in calendarDays" :key="day.date" :class="{ active: day.isToday }">
              {{ day.label }}
            </span>
          </div>
        </div>

        <!-- 预约 -->
        <div class="appointments">
          <div class="appointment-card green">
            <div class="icon"><i class="icon-tooth"></i></div>
            <div class="info">
              <strong>Dentist</strong>
              8:00–9:30
              Dr. Alex Brown (cost: 39)
            </div>
            <div class="status">●</div>
          </div>
          <div class="appointment-card white">
            <div class="icon"><i class="icon-heart"></i></div>
            <div class="info">
              <strong>Cardiologist</strong>
              9:45–11:50
              Dr. Elika Clark (cost: 61)
            </div>
          </div>
        </div>

        <!-- 治疗方案 -->
        <div class="treatment">
          <h4>Your treatment</h4>
          <div class="treatment-item">
            <div class="icon"><i class="icon-pill"></i></div>
            <div class="text">
              <strong>Gentle Iron</strong>
              2 capsules with meals every day
            </div>
            <i class="icon-dots"></i>
          </div>
          <div class="treatment-item">
            <div class="icon"><i class="icon-pill"></i></div>
            <div class="text">
              <strong>Vitamin D</strong>
              1 tablet after a meal every day
            </div>
            <i class="icon-dots"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardContent',
  data() {
    return {
      timeRange: 'Year',
      activityTime: 'Week',
      calendarDays: [
        { label: 'Mo', date: '18' },
        { label: 'Tu', date: '19' },
        { label: 'We', date: '20', isToday: true },
        { label: 'Th', date: '21' },
        { label: 'Fr', date: '22' },
        { label: 'Sa', date: '23' },
        { label: 'Su', date: '24' },
      ],
      activityData: [
        { height: 30 },
        { height: 40 },
        { height: 50 },
        { height: 80 }, // 高亮周三
        { height: 60 },
        { height: 45 },
        { height: 55 },
      ]
    }
  },
  methods: {
    toggleYear() {
      // 可扩展：切换年份
    }
  }
}
</script>

<style scoped>
.dashboard-content {
  padding: 20px;
  background-color: #f5f9f6;
  min-height: calc(100vh - 60px); /* 假设侧边栏高60px */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部工具栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f7f4;
  padding: 6px 12px;
  border-radius: 20px;
  width: 300px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

/* 主体网格：两列 */
.main-grid {
  display: flex;
  gap: 20px;
  flex: 1;
}

.main-left {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 促销横幅 */
.promo-banner {
  display: flex;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  gap: 20px;
}

.promo-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.promo-text p {
  margin: 0;
  font-size: 14px;
  color: #777;
}

.promo-image img {
  width: 120px;
  height: auto;
  object-fit: contain;
}

/* 健康统计 */
.health-stats {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.time-toggle button {
  background: #e0f2f1;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 5px;
  font-size: 12px;
  cursor: pointer;
}

.time-toggle button.active {
  background: #4ECDC4;
  color: white;
}

.chart-placeholder {
  height: 120px;
  position: relative;
}

.line-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 80px;
  margin-top: 10px;
}

.line-ch .line {
  border-radius: 2px;
}

.chart-label {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

/* 心率 & 活动卡片行 */
.cards-row {
  display: flex;
  gap: 20px;
}

.card {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.heart-rate {
  background: #4ECDC4;
  color: white;
}

.heart-rate .value {
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0;
}

.heart-rate small {
  font-size: 14px;
  opacity: 0.8;
}

.wave svg {
  width: 100%;
  height: 40px;
}

.activity .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 80px;
  margin-top: 10px;
}

.bar {
  width: 8px;
  border-radius: 2px;
}

/* 右侧卡片 */
.user-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info strong {
  display: block;
  font-size: 16px;
  color: #333;
}

.user-info small {
  color: #777;
  font-size: 12px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.stat-item .label {
  font-size: 12px;
  color: #666;
}

.stat-item .value {
  font-weight: bold;
  color: #333;
}

/* 日历 */
.calendar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.calendar h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.days {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.days span {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.days span.active {
  background: #4ECDC4;
  color: white;
  font-weight: bold;
}

/* 预约 */
.appointments {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.appointment-card {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  gap: 10px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.appointment-card.green {
  background: #4ECDC4;
  color: white;
}

.appointment-card.white {
  background: #f8faf9;
}

.icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info strong {
  display: block;
  font-size: 14px;
  margin-bottom: 2px;
}

.info div {
  font-size: 12px;
  opacity: 0.8;
}

.status {
  margin-left: auto;
  font-size: 20px;
}

/* 治疗方案 */
.treatment {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.treatment h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.treatment-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.treatment-item .icon {
  width: 20px;
  height: 20px;
  background: #4ECDC4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.text strong {
  display: block;
  font-size: 14px;
  color: #333;
}

.text div {
  font-size: 12px;
  color: #777;
}

.icon-dots {
  margin-left: auto;
  font-size: 16px;
  color: #999;
}

/* 图标占位（你可替换为真实图标库） */
.icon-search::before { content: "🔍"; }
.icon-clock::before { content: "⏰"; }
.icon-arrow-right::before { content: "→"; }
.icon-menu::before { content: "☰"; }
.icon-tooth::before { content: "🦷"; }
.icon-heart::before { content: "❤️"; }
.icon-pill::before { content: "💊"; }
.icon-dots::before { content: "⋯"; }

</style>