<template>
  <div class="devices-page">
    <div class="page-header">
      <h3>设备列表</h3>
      <button class="add-btn" @click="addDevice">+ 添加设备</button>
    </div>
    
    <div class="device-grid">
      <div v-for="device in devices" :key="device.id" class="device-item">
        <div class="device-icon">📹</div>
        <div class="device-info">
          <div class="device-name">{{ device.name }}</div>
          <div class="device-id">SN: {{ device.sn || '未设置' }}</div>
        </div>
        <div class="device-status" :class="{ online: device.online }">
          {{ device.online ? '在线' : '离线' }}
        </div>
        <div class="device-actions">
          <button class="edit-btn" @click="editDevice(device)">编辑</button>
          <button class="delete-btn" @click="deleteDevice(device.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const devices = ref([
  { id: 1, name: '笼盒A-01', sn: 'EZ123456', online: true },
  { id: 2, name: '笼盒A-02', sn: 'EZ123457', online: true },
  { id: 3, name: '笼盒B-01', sn: 'EZ123458', online: false },
  { id: 4, name: '笼盒B-02', sn: 'EZ123459', online: true }
])

const addDevice = () => {
  alert('添加设备（实际应调API）')
}

const editDevice = (device) => {
  alert(`编辑设备: ${device.name}`)
}

const deleteDevice = (id) => {
  if (confirm('确定删除该设备吗？')) {
    devices.value = devices.value.filter(d => d.id !== id)
  }
}
</script>

<style scoped>
.devices-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h3 {
  color: #fff;
  font-size: 18px;
}

.add-btn {
  background: #409eff;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.device-grid {
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #1e293b;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #1e293b;
  gap: 16px;
}

.device-item:last-child {
  border-bottom: none;
}

.device-icon {
  font-size: 24px;
}

.device-info {
  flex: 1;
}

.device-name {
  color: #fff;
  font-weight: 500;
}

.device-id {
  color: #9ca3af;
  font-size: 12px;
  margin-top: 4px;
}

.device-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  background: #1e293b;
  color: #9ca3af;
}

.device-status.online {
  background: #1e3a2e;
  color: #67c23a;
}

.device-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background: #1e293b;
  border: none;
  color: #9ca3af;
}

.edit-btn:hover {
  background: #2d3a4e;
  color: #fff;
}

.delete-btn {
  background: #3a1e1e;
  border: none;
  color: #f56c6c;
}

.delete-btn:hover {
  background: #5a2e2e;
}
</style>