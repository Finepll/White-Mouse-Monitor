<template>
  <div class="ai-analysis-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="title">
        <span class="icon">🤖</span>
        AI 智能分析中心
      </div>
      <div class="tips">基于行为识别 · 智能监测 · 自动生成报告</div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="data-cards">
      <div class="card">
        <div class="card-icon">📊</div>
        <div class="card-text">
          <div class="num">286</div>
          <div class="label">总分析样本</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">🧪</div>
        <div class="card-text">
          <div class="num">正常</div>
          <div class="label">行为状态</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">⚠️</div>
        <div class="card-text">
          <div class="num">3 次</div>
          <div class="label">异常行为预警</div>
        </div>
      </div>
      <div class="card">
        <div class="card-icon">📈</div>
        <div class="card-text">
          <div class="num">98.2%</div>
          <div class="label">分析准确率</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-wrapper">
      <div class="chart-box">
        <div class="chart-title">实验体活动趋势分析</div>
        <div class="chart-demo">
          <div class="fake-chart">
            <div class="line" style="height: 40%"></div>
            <div class="line" style="height: 60%"></div>
            <div class="line" style="height: 55%"></div>
            <div class="line" style="height: 80%"></div>
            <div class="line" style="height: 70%"></div>
            <div class="line" style="height: 90%"></div>
            <div class="line" style="height: 85%"></div>
            <div class="line" style="height: 75%"></div>
            <div class="line" style="height: 65%"></div>
            <div class="line" style="height: 88%"></div>
            <div class="line" style="height: 92%"></div>
            <div class="line" style="height: 78%"></div>
          </div>
        </div>
      </div>

      <div class="chart-box">
        <div class="chart-title">AI 行为分类占比</div>
        <div class="pie-demo">
          <div class="pie-item">
            <span class="color" style="background:#409eff"></span>
            正常活动 68%
          </div>
          <div class="pie-item">
            <span class="color" style="background:#67c23a"></span>
            进食饮水 18%
          </div>
          <div class="pie-item">
            <span class="color" style="background:#e6a23c"></span>
            应激反应 9%
          </div>
          <div class="pie-item">
            <span class="color" style="background:#f56c6c"></span>
            异常行为 5%
          </div>
        </div>
      </div>
    </div>

    <!-- AI 分析结果 -->
    <div class="result-box">
      <div class="result-title">🧠 AI 智能分析结论</div>
      <div class="result-content">
        <div class="item">
          <label>分析对象：</label>
          <span>小白鼠实验样本（编号：M001 - M030）</span>
        </div>
        <div class="item">
          <label>行为状态：</label>
          <span class="green">整体健康、活动规律正常</span>
        </div>
        <div class="item">
          <label>异常识别：</label>
          <span class="red">3 处异常行为（短暂躁动、应激反应）</span>
        </div>
        <div class="item">
          <label>AI 建议：</label>
          <span>继续观察，加强环境稳定性，降低噪音干扰</span>
        </div>
        <div class="item">
          <label>生成时间：</label>
          <span>{{ new Date().toLocaleString() }}</span>
        </div>
      </div>
      <div class="btns">
        <button class="btn primary">开始AI分析</button>
        <button class="btn success">导出分析报告</button>
        <button class="btn normal">查看历史记录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 无需逻辑，纯展示页面
</script>

<style scoped>
.ai-analysis-page {
  width: 100%;
  padding: 8px;
}

/* 顶部标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 24px;
}

.tips {
  font-size: 14px;
  color: #64748b;
}

/* 数据卡片 */
.data-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 12px;
}

.card-text .num {
  font-size: 24px;
  font-weight: bold;
  color: #1e293b;
}

.card-text .label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* 图表区域 */
.chart-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-box {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

/* 模拟折线图 */
.fake-chart {
  width: 100%;
  height: 240px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.line {
  flex: 1;
  background: linear-gradient(to top, #409eff, #8cc7ff);
  border-radius: 4px 4px 0 0;
}

/* 饼图分类 */
.pie-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #333;
}

.pie-item .color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

/* AI 分析结果 */
.result-box {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.result-content {
  margin-bottom: 24px;
}

.result-content .item {
  display: flex;
  margin-bottom: 12px;
  font-size: 15px;
}

.result-content label {
  width: 110px;
  color: #475569;
  font-weight: 500;
}

.result-content span {
  color: #1e293b;
}

.green {
  color: #059669 !important;
  font-weight: 500;
}

.red {
  color: #dc2626 !important;
  font-weight: 500;
}

.btns {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.btn.primary {
  background: #2563eb;
  color: #fff;
}

.btn.success {
  background: #059669;
  color: #fff;
}

.btn.normal {
  background: #f1f5f9;
  color: #333;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>