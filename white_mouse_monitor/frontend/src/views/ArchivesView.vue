<template>
  <div class="history-page">
    <!-- 标题 -->
    <div class="page-header">
      <h2>小白鼠监测历史记录</h2>
      <p>查看所有小鼠的进食量、活跃度历史数据</p>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-item">
        <label>小鼠编号：</label>
        <input v-model="searchId" type="text" placeholder="输入编号搜索" />
      </div>
      <div class="filter-item">
        <label>时间范围：</label>
        <input v-model="startTime" type="datetime-local" />
        <span> ~ </span>
        <input v-model="endTime" type="datetime-local" />
      </div>
      <button class="search-btn" @click="searchData">查询记录</button>
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>序号</th>
            <th>小鼠编号</th>
            <th>进食量（g）</th>
            <th>活跃度（%）</th>
            <th>监测时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in tableData" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.mouseId }}</td>
            <td>{{ item.food }}</td>
            <td>{{ item.active }}</td>
            <td>{{ item.time }}</td>
            <td>
              <span :class="['status-tag', item.status === '正常' ? 'normal' : 'abnormal']">
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button>上一页</button>
      <span>第 1 页</span>
      <button>下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 筛选
const searchId = ref('')
const startTime = ref('')
const endTime = ref('')

// 表格数据（模拟真实监测历史）
const tableData = ref([
  { mouseId: 'M001', food: 5.2, active: 86, time: '2025-08-10 08:30:21', status: '正常' },
  { mouseId: 'M002', food: 3.8, active: 72, time: '2025-08-10 08:31:15', status: '正常' },
  { mouseId: 'M003', food: 2.1, active: 45, time: '2025-08-10 08:32:03', status: '异常' },
  { mouseId: 'M001', food: 5.5, active: 90, time: '2025-08-10 12:15:44', status: '正常' },
  { mouseId: 'M004', food: 4.9, active: 78, time: '2025-08-10 16:20:11', status: '正常' },
])

// 查询
const searchData = () => {
  console.log('查询条件：', searchId.value, startTime.value, endTime.value)
  // 这里以后对接后端接口
}
</script>

<style scoped>
.history-page {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  color: #1e2a3a;
  margin: 0 0 6px 0;
}

.page-header p {
  font-size: 14px;
  color: #8a9bb0;
  margin: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: #333;
}

.filter-item input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
}

.search-btn {
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.search-btn:hover {
  background: #338eef;
}

/* 表格 */
.table-container {
  width: 100%;
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid #e4e7ed;
}

.history-table th {
  background: #f5f7fa;
  color: #666;
  font-weight: 500;
}

/* 状态标签 */
.status-tag {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.status-tag.normal {
  background: #e6f7e6;
  color: #2e7d32;
}

.status-tag.abnormal {
  background: #ffebee;
  color: #c62828;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
</style>