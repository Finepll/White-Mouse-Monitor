<template>
  <div class="stat-card">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-info">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="trend" class="stat-trend" :class="trendType">
      {{ trend }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  value: [String, Number],
  label: String,
  trend: String,
  trendType: {
    type: String,
    default: 'up'
  }
})
</script>

<style scoped>
.stat-card {
  background: #0f172a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #1e293b;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #409eff;
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  background: #1e293b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
}

.stat-label {
  color: #9ca3af;
  font-size: 12px;
  margin-top: 4px;
}

.stat-trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 20px;
}

.stat-trend.up {
  background: #1e3a2e;
  color: #67c23a;
}

.stat-trend.down {
  background: #3a1e1e;
  color: #f56c6c;
}
</style>