<template>
  <div class="video-page">
    <div class="video-container">
      <div class="video-wrapper">
        <video
          ref="videoRef"
          class="video-player"
          :src="videoUrl"
          controls
          autoplay
          muted
          loop
          poster="/小鼠.ico"
        ></video>
        <div class="video-overlay" v-if="!videoUrl">
          <span class="loading-text">视频加载中...</span>
        </div>
      </div>
      <div class="video-info">
        <h3>{{ deviceName }}</h3>
        <div class="device-status" :class="{ online: isOnline }">
          {{ isOnline ? '● 在线' : '○ 离线' }}
        </div>
      </div>
    </div>

    <div class="device-list">
      <h4>设备列表</h4>
      <div class="device-grid">
        <div
          v-for="device in devices"
          :key="device.id"
          class="device-item"
          :class="{ active: currentDeviceId === device.id }"
          @click="switchDevice(device)"
        >
          <div class="device-icon">📹</div>
          <div class="device-name">{{ device.name }}</div>
          <div class="device-status-small" :class="{ online: device.online }">
            {{ device.online ? '在线' : '离线' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 模拟设备列表
const devices = ref([
  { id: 1, name: '笼盒A-01', online: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: 2, name: '笼盒A-02', online: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4' },
  { id: 3, name: '笼盒B-01', online: false, videoUrl: '' },
  { id: 4, name: '笼盒B-02', online: true, videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
])

const currentDeviceId = ref(1)
const videoUrl = ref('')
const deviceName = ref('')
const isOnline = ref(false)

const switchDevice = (device) => {
  currentDeviceId.value = device.id
  deviceName.value = device.name
  isOnline.value = device.online
  videoUrl.value = device.online ? device.videoUrl : ''
}

// 初始化第一个设备
onMounted(() => {
  if (devices.value.length > 0) {
    switchDevice(devices.value[0])
  }
})
</script>

<style scoped>
.video-page {
  display: flex;
  gap: 24px;
  width: 100%;
  flex-wrap: wrap;
}

.video-container {
  flex: 2;
  min-width: 300px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e4e7ed;
}

.video-wrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #fff;
  font-size: 14px;
}

.video-info {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e4e7ed;
}

.video-info h3 {
  font-size: 16px;
  color: #1e2a3a;
}

.device-status {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f0f0f0;
  color: #999;
}

.device-status.online {
  background: #e6f7e6;
  color: #2e7d32;
}

.device-list {
  flex: 1;
  min-width: 200px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e4e7ed;
}

.device-list h4 {
  font-size: 14px;
  color: #8a9bb0;
  margin-bottom: 16px;
}

.device-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e4e7ed;
}

.device-item:hover {
  background: #f5f7fa;
}

.device-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.device-icon {
  font-size: 20px;
}

.device-name {
  flex: 1;
  font-size: 14px;
  color: #1e2a3a;
}

.device-status-small {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f0f0f0;
  color: #999;
}

.device-status-small.online {
  background: #e6f7e6;
  color: #2e7d32;
}
</style>