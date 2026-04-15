<template>
  <div class="system-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>系统管理</h2>
      <p>用户管理、权限配置、系统参数设置</p>
    </div>

    <!-- 选项卡 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 用户管理 -->
    <div v-show="activeTab === 'user'" class="tab-content">
      <div class="tool-bar">
        <button class="add-btn">+ 新增用户</button>
        <input v-model="userSearch" placeholder="搜索用户名" class="search-input" />
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in userList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.role }}</td>
            <td>
              <span :class="['status', item.status === '正常' ? 'normal' : 'forbidden']">
                {{ item.status }}
              </span>
            </td>
            <td>{{ item.createTime }}</td>
            <td>
              <button class="edit-btn">编辑</button>
              <button class="del-btn">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 权限管理 -->
    <div v-show="activeTab === 'auth'" class="tab-content">
      <div class="auth-list">
        <div class="auth-item">
          <label><input type="checkbox" checked /> 查看监测数据</label>
          <label><input type="checkbox" checked /> 导出数据</label>
          <label><input type="checkbox" /> 删除数据</label>
          <label><input type="checkbox" /> 用户管理</label>
          <label><input type="checkbox" /> 系统设置</label>
        </div>
      </div>
    </div>

    <!-- 系统设置 -->
    <div v-show="activeTab === 'setting'" class="tab-content">
      <div class="form-item">
        <label>系统名称：</label>
        <input value="小白鼠监测管理系统" />
      </div>
      <div class="form-item">
        <label>自动刷新时间：</label>
        <input value="30秒" />
      </div>
      <div class="form-item">
        <label>异常报警：</label>
        <input type="checkbox" checked /> 开启报警
      </div>
      <button class="save-btn">保存设置</button>
    </div>

    <!-- 操作日志 -->
    <div v-show="activeTab === 'log'" class="tab-content">
      <table class="table">
        <thead>
          <tr>
            <th>时间</th>
            <th>用户</th>
            <th>操作内容</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2025-08-10 15:30</td>
            <td>admin</td>
            <td>修改监测参数</td>
            <td>192.168.1.100</td>
          </tr>
          <tr>
            <td>2025-08-10 14:20</td>
            <td>test</td>
            <td>查看历史记录</td>
            <td>192.168.1.101</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 选项卡
const activeTab = ref('user')
const tabs = [
  { key: 'user', label: '用户管理' },
  { key: 'auth', label: '权限管理' },
  { key: 'setting', label: '系统设置' },
  { key: 'log', label: '操作日志' }
]

// 用户搜索
const userSearch = ref('')

// 用户列表
const userList = ref([
  { id: 1, name: 'admin', role: '超级管理员', status: '正常', createTime: '2025-01-01' },
  { id: 2, name: 'test', role: '普通用户', status: '正常', createTime: '2025-01-02' },
  { id: 3, name: 'guest', role: '访客', status: '禁用', createTime: '2025-01-03' }
])
</script>

<style scoped>
.system-page {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1e2a3a;
}
.page-header p {
  margin: 4px 0 20px 0;
  color: #8a9bb0;
  font-size: 14px;
}

/* 选项卡 */
.tab-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
}
.tab-btn.active {
  background: #409eff;
  color: #fff;
}

/* 工具栏 */
.tool-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}
.add-btn {
  background: #409eff;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
}
.search-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

/* 表格 */
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #e4e7ed;
}
.table th {
  background: #f5f7fa;
  color: #666;
}

/* 状态 */
.status {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
}
.status.normal {
  background: #e6f7e6;
  color: #2e7d32;
}
.status.forbidden {
  background: #ffebee;
  color: #c62828;
}

/* 按钮 */
.edit-btn {
  border: 1px solid #409eff;
  color: #409eff;
  background: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 6px;
}
.del-btn {
  border: 1px solid #f56c6c;
  color: #f56c6c;
  background: #fff;
  padding: 3px 8px;
  border-radius: 4px;
}

/* 表单 */
.form-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-item label {
  width: 100px;
  font-size: 14px;
}
.form-item input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.save-btn {
  background: #409eff;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
}

/* 权限 */
.auth-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
}
</style>