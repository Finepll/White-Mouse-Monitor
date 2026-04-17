<template>
  <div class="live-monitor-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📹 实时直播</h1>
        <div class="sub">实验动物房实时监控 · 支持多设备切换</div>
      </div>
      <div class="header-actions">
        <button class="btn-fullscreen" @click="toggleFullscreen">
          <span class="fullscreen-icon">{{ isFullscreen ? '✕' : '⛶' }}</span>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>
        <button class="btn-refresh" @click="refreshStream">
          <span class="refresh-icon">⟳</span> 刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ devices.length }}</div>
        <div class="stat-label-mini">在线设备</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ onlineCount }}</div>
        <div class="stat-label-mini">直播中</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ recordingCount }}</div>
        <div class="stat-label-mini">录像中</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ viewerCount }}</div>
        <div class="stat-label-mini">观看人数</div>
      </div>
    </div>

    <!-- 主直播区域 -->
    <div class="live-main">
      <div class="video-container" ref="videoContainer">
        <div class="video-wrapper" :class="{ fullscreen: isFullscreen }">
          <!-- 视频播放器区域 - 萤石开放平台集成位置 -->
          <div id="ezuikit-player" class="ezuikit-player" ref="playerContainer">
            <div v-if="!isStreamReady" class="loading-overlay">
              <div class="loading-spinner"></div>
              <p>正在加载直播流...</p>
            </div>
            <div v-if="streamError" class="error-overlay">
              <span class="error-icon">⚠️</span>
              <p>直播连接失败，请检查网络或设备状态</p>
              <button class="retry-btn" @click="retryStream">重试</button>
            </div>
          </div>
          <!-- 视频信息栏 -->
          <div class="video-info-bar">
            <div class="device-info">
              <span class="device-name">{{ currentDevice.name }}</span>
              <span class="device-location">{{ currentDevice.location }}</span>
            </div>
            <div class="live-status">
              <span class="live-dot"></span>
              <span>直播中</span>
            </div>
          </div>
          <!-- 控制栏 -->
          <div class="video-controls">
            <button class="control-btn" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
              {{ isMuted ? '🔇' : '🔊' }}
            </button>
            <button class="control-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="captureSnapshot" title="截图">
              📸
            </button>
            <button class="control-btn" @click="toggleRecording" :title="isRecording ? '停止录像' : '开始录像'">
              {{ isRecording ? '⏹️' : '🔴' }}
            </button>
            <button class="control-btn" @click="toggleFullscreen" title="全屏">
              {{ isFullscreen ? '✕' : '⛶' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 设备列表侧边栏 -->
      <div class="device-sidebar">
        <div class="sidebar-header">
          <span class="header-icon">📡</span>
          <span>摄像头列表</span>
          <span class="device-count">{{ devices.length }}</span>
        </div>
        <div class="device-list">
          <div
            v-for="device in devices"
            :key="device.id"
            class="device-item"
            :class="{ active: currentDevice.id === device.id, offline: !device.online }"
            @click="switchDevice(device)"
          >
            <div class="device-preview">
              <div class="preview-placeholder">
                <span class="preview-icon">{{ device.online ? '📹' : '📴' }}</span>
              </div>
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.name }}</div>
              <div class="device-location">{{ device.location }}</div>
            </div>
            <div class="device-status">
              <span class="status-dot" :class="{ online: device.online, offline: !device.online }"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 截图预览模态框 -->
    <div v-if="snapshotModalVisible" class="modal-overlay" @click.self="closeSnapshotModal">
      <div class="modal-container snapshot-modal">
        <div class="modal-header">
          <h3>📸 截图预览</h3>
          <button class="close-btn" @click="closeSnapshotModal">×</button>
        </div>
        <div class="modal-body">
          <img :src="snapshotUrl" class="snapshot-image" alt="截图" />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeSnapshotModal">关闭</button>
          <button class="btn-primary" @click="downloadSnapshot">下载图片</button>
        </div>
      </div>
    </div>

    <!-- 录像列表模态框 -->
    <div v-if="recordingsModalVisible" class="modal-overlay" @click.self="closeRecordingsModal">
      <div class="modal-container recordings-modal">
        <div class="modal-header">
          <h3>📼 录像列表</h3>
          <button class="close-btn" @click="closeRecordingsModal">×</button>
        </div>
        <div class="modal-body">
          <div v-for="rec in recordings" :key="rec.id" class="recording-item">
            <div class="recording-info">
              <div class="recording-name">{{ rec.name }}</div>
              <div class="recording-time">{{ rec.time }}</div>
            </div>
            <button class="play-recording-btn" @click="playRecording(rec)">播放</button>
          </div>
          <div v-if="recordings.length === 0" class="empty-recordings">
            暂无录像记录
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeRecordingsModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 设备列表（模拟数据）
const devices = ref([
  { id: 'cam_001', name: 'A区 - SPF动物房', location: '实验楼A栋 3F', online: true, deviceSerial: 'E12345678', channelNo: 1 },
  { id: 'cam_002', name: 'B区 - 观察室', location: '实验楼B栋 2F', online: true, deviceSerial: 'E87654321', channelNo: 1 },
  { id: 'cam_003', name: 'C区 - 隔离区', location: '实验楼C栋 1F', online: false, deviceSerial: 'E11223344', channelNo: 1 },
  { id: 'cam_004', name: 'D区 - 手术室', location: '实验楼A栋 5F', online: true, deviceSerial: 'E55667788', channelNo: 1 },
  { id: 'cam_005', name: 'E区 - 饲养间', location: '实验楼B栋 1F', online: true, deviceSerial: 'E99001122', channelNo: 1 }
])

// 当前选中的设备
const currentDevice = ref(devices.value[0])

// 直播状态
const isStreamReady = ref(false)
const streamError = ref(false)
const isPlaying = ref(true)
const isMuted = ref(false)
const isRecording = ref(false)
const isFullscreen = ref(false)

// 统计数据
const onlineCount = computed(() => devices.value.filter(d => d.online).length)
const recordingCount = ref(0)
const viewerCount = ref(12)

// 截图相关
const snapshotModalVisible = ref(false)
const snapshotUrl = ref('')

// 录像相关
const recordingsModalVisible = ref(false)
const recordings = ref([
  { id: 1, name: '2025-01-20 A区记录', time: '2025-01-20 14:30:00' },
  { id: 2, name: '2025-01-19 A区记录', time: '2025-01-19 10:15:00' },
  { id: 3, name: '2025-01-18 A区记录', time: '2025-01-18 16:20:00' }
])

// DOM 引用
const playerContainer = ref(null)
const videoContainer = ref(null)

// 萤石开放平台集成函数
// 请在使用前替换以下参数为您自己的萤石开放平台配置
const EZVIZ_CONFIG = {
  appKey: 'YOUR_APP_KEY',           // 替换为您的 AppKey
  accessToken: 'YOUR_ACCESS_TOKEN', // 替换为您的 AccessToken
  apiUrl: 'https://open.ys7.com/api/live/v2'
}

/**
 * 初始化萤石播放器
 * 文档参考: https://open.ys7.com/help/146
 */
const initEzvizPlayer = () => {
  if (!currentDevice.value.online) {
    streamError.value = true
    isStreamReady.value = false
    return
  }

  // 模拟加载中状态
  isStreamReady.value = false
  streamError.value = false

  // 延迟模拟加载过程（实际使用时替换为真实API调用）
  setTimeout(() => {
    // 模拟成功加载
    isStreamReady.value = true
    streamError.value = false
    
    // 实际集成示例代码（取消注释并使用真实配置）:
    /*
    const { EZUIKit } = window
    if (EZUIKit) {
      const player = new EZUIKit.EZUIKitPlayer({
        id: 'ezuikit-player',
        accessToken: EZVIZ_CONFIG.accessToken,
        url: `ezopen://${currentDevice.value.deviceSerial}/${currentDevice.value.channelNo}?begin=0&type=1`,
        width: '100%',
        height: '100%',
        handleSuccess: () => {
          console.log('直播连接成功')
          isStreamReady.value = true
        },
        handleError: (error) => {
          console.error('直播连接失败:', error)
          streamError.value = true
        }
      })
    } else {
      console.warn('萤石SDK未加载，请引入ezuikit.js')
      // 模拟演示模式
      isStreamReady.value = true
    }
    */
  }, 1500)
}

// 切换设备
const switchDevice = (device) => {
  if (!device.online) {
    streamError.value = true
    isStreamReady.value = false
    currentDevice.value = device
    return
  }
  currentDevice.value = device
  // 重新初始化播放器
  initEzvizPlayer()
}

// 刷新直播流
const refreshStream = () => {
  initEzvizPlayer()
}

// 重试连接
const retryStream = () => {
  initEzvizPlayer()
}

// 静音切换
const toggleMute = () => {
  isMuted.value = !isMuted.value
  // 实际集成时调用播放器的静音方法
}

// 播放/暂停
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  // 实际集成时调用播放器的播放/暂停方法
}

// 截图
const captureSnapshot = () => {
  // 实际集成时从播放器获取截图
  // 模拟截图
  snapshotUrl.value = `https://picsum.photos/800/450?random=${Date.now()}`
  snapshotModalVisible.value = true
}

// 关闭截图模态框
const closeSnapshotModal = () => {
  snapshotModalVisible.value = false
  snapshotUrl.value = ''
}

// 下载截图
const downloadSnapshot = () => {
  const link = document.createElement('a')
  link.download = `snapshot_${new Date().getTime()}.jpg`
  link.href = snapshotUrl.value
  link.click()
}

// 录像切换
const toggleRecording = () => {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    recordingCount.value++
    // 实际集成时调用开始录像接口
  } else {
    // 实际集成时调用停止录像接口
  }
}

// 全屏切换（支持再次点击退出全屏）
const toggleFullscreen = () => {
  if (isFullscreen.value) {
    exitFullscreen()
  } else {
    enterFullscreen()
  }
}

const enterFullscreen = () => {
  const elem = videoContainer.value
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen()
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

// 全屏变化监听
const handleFullscreenChange = () => {
  isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement)
}

// 打开录像列表
const openRecordings = () => {
  recordingsModalVisible.value = true
}

const closeRecordingsModal = () => {
  recordingsModalVisible.value = false
}

const playRecording = (rec) => {
  alert(`播放录像: ${rec.name}`)
  closeRecordingsModal()
}

// 组件挂载
onMounted(() => {
  initEzvizPlayer()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.live-monitor-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: transparent;
  min-height: 100%;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-left h1 {
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2c3e4e, #1a4d3e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.sub {
  color: #5b6e8c;
  font-size: 0.9rem;
  margin-top: 0.3rem;
  border-left: 3px solid #2c9a6e;
  padding-left: 0.75rem;
}

.header-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-fullscreen, .btn-refresh {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-fullscreen {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #2c5f4a;
  border: 1px solid #e2e8f0;
}

.btn-fullscreen:hover {
  background: white;
}

.btn-refresh {
  background: rgba(224, 242, 233, 0.9);
  backdrop-filter: blur(4px);
  color: #1f7840;
  border: 1px solid #c8e6d9;
}

.btn-refresh:hover {
  background: #e0f2e9;
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.stat-card-mini {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  min-width: 100px;
  text-align: center;
}

.stat-number-mini {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f5e4a;
}

.stat-label-mini {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #5e7a93;
  margin-top: 0.2rem;
}

/* 主直播区域 */
.live-main {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.video-container {
  flex: 3;
  min-width: 300px;
}

.video-wrapper {
  position: relative;
  background: #1a1a2e;
  border-radius: 1rem;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.video-wrapper.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
  aspect-ratio: auto;
}

.ezuikit-player {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0f0f1a;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #2c9a6e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 10;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background: #2c9a6e;
  border: none;
  border-radius: 40px;
  color: white;
  cursor: pointer;
}

/* 视频信息栏 */
.video-info-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
  color: white;
  z-index: 5;
}

.device-info {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.device-location {
  font-size: 0.7rem;
  opacity: 0.8;
}

.live-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  background: rgba(0,0,0,0.5);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #e25c3e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 控制栏 */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  z-index: 5;
}

.control-btn {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(44, 154, 110, 0.8);
  transform: scale(1.05);
}

/* 设备侧边栏 */
.device-sidebar {
  flex: 1;
  min-width: 260px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(250, 252, 255, 0.8);
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c4b3e;
}

.device-count {
  margin-left: auto;
  background: #e0f2e9;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
}

.device-list {
  max-height: 500px;
  overflow-y: auto;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f3f9;
}

.device-item:hover {
  background: rgba(250, 254, 251, 0.8);
}

.device-item.active {
  background: rgba(238, 246, 242, 0.9);
  border-left: 3px solid #2c9a6e;
}

.device-item.offline {
  opacity: 0.6;
}

.device-preview {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
}

.preview-icon {
  font-size: 1.5rem;
}

.device-info {
  flex: 1;
}

.device-item .device-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
}

.device-item .device-location {
  font-size: 0.7rem;
  color: #8ba0b5;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.online {
  background: #2c9a6e;
  box-shadow: 0 0 4px #2c9a6e;
}

.status-dot.offline {
  background: #bc4e2c;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 1.25rem;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eef2f6;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #94a3b8;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eef2f6;
}

.snapshot-image {
  width: 100%;
  border-radius: 0.5rem;
}

.recording-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f3f9;
}

.recording-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.recording-time {
  font-size: 0.7rem;
  color: #8ba0b5;
}

.play-recording-btn {
  background: #e0f2e9;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  color: #1f7840;
}

.empty-recordings {
  text-align: center;
  padding: 2rem;
  color: #8ba0b5;
}

.btn-primary {
  background: #1f5e4a;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  color: white;
  cursor: pointer;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  color: #2c5f4a;
  cursor: pointer;
}

/* 响应式 */
@media (max-width: 900px) {
  .live-monitor-container {
    padding: 1rem;
  }
  .live-main {
    flex-direction: column;
  }
  .device-sidebar {
    min-width: auto;
  }
  .video-controls {
    gap: 0.4rem;
  }
  .control-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
}
</style>