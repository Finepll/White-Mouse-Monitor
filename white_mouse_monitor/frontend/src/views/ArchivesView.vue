<template>
  <div class="rat-record-page"> 

    <div class="container">
      <!-- 卡片列表 -->
      <div class="card-grid">
        <div
          class="animal-card"
          v-for="(item, index) in cardList"
          :key="index"
        >
          <div class="card-status-dot"></div>
          <img
            class="card-image"
            src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
            alt="实验鼠"
          />
          <div class="card-info">
            <p>{{ item.line1 }}</p>
            <p>{{ item.line2 }}</p>
            <p>{{ item.line3 }}</p>
          </div>
        </div>
      </div>

      <!-- 右侧按钮栏 -->
      <div class="sidebar">
        <button class="new-card-btn">新建档案卡片</button>
        <p class="btn-desc">点击可进入详情页查看“每日评分”</p>

        <button class="score-btn">
          <svg viewBox="0 0 24 24" class="icon">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            />
          </svg>
          综合评分
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 卡片数据（可自由修改）
const cardList = [
  { line1: "实验编号", line2: "性别", line3: "分组" },
  { line1: "实验编号", line2: "性别", line3: "日龄" },
  { line1: "笼号", line2: "性别", line3: "分组" },
  { line1: "笼号", line2: "性别", line3: "分组" },
  { line1: "笼号", line2: "日龄", line3: "分组" },
  { line1: "实验编号", line2: "性别", line3: "分组" },
  { line1: "实验编号", line2: "性别", line3: "日龄" },
  { line1: "笼号", line2: "性别", line3: "分组" },
  { line1: "实验编号", line2: "性别", line3: "日龄" },
  { line1: "实验编号", line2: "性别", line3: "分组" },
];
</script>

<style scoped>
.rat-record-page {
  background-color: transparent;
  padding: 24px;
  min-height: 100vh;
}


.container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  flex: 1;
}

.animal-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.animal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.card-status-dot {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.card-info {
  padding: 16px;
}

.card-info p {
  font-size: 16px;
  color: #374151;
  margin: 6px 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding-top: 40px;
}

.new-card-btn {
  background-color: #1d4ed8;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.new-card-btn:hover {
  background-color: #1e40af;
}

.btn-desc {
  color: #4b5563;
  font-size: 16px;
  text-align: center;
}

.score-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 18px;
  color: #1d4ed8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.score-btn:hover {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.icon {
  width: 20px;
  height: 20px;
  fill: #1d4ed8;
}

/* 响应式 */
@media (max-width: 900px) {
  .container {
    flex-direction: column;
  }
  .sidebar {
    flex-direction: row;
    justify-content: center;
    padding-top: 0;
  }
}
</style>