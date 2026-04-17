<template>
  <div class="video-playback-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>📼 视频回放</h1>
        <div class="sub">历史录像查询与回放 · 支持多设备检索</div>
      </div>
      <div class="header-actions">
        <button class="btn-fullscreen" @click="toggleFullscreen">
          <span class="fullscreen-icon">{{ isFullscreen ? '✕' : '⛶' }}</span>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalRecordings }}</div>
        <div class="stat-label-mini">录像总数</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ availableDevices }}</div>
        <div class="stat-label-mini">可用设备</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ storageDays }}</div>
        <div class="stat-label-mini">存储天数</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalDuration }}</div>
        <div class="stat-label-mini">总时长(h)</div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="search-card">
      <div class="search-title">
        <span class="title-icon">🔍</span>
        <span>录像查询</span>
      </div>
      <div class="search-form">
        <div class="form-row">
          <div class="form-group">
            <label>选择设备</label>
            <select v-model="selectedDeviceId" class="form-select">
              <option value="all">全部设备</option>
              <option v-for="device in devices" :key="device.id" :value="device.id">
                {{ device.name }} ({{ device.location }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>日期范围</label>
            <div class="date-range">
              <input type="date" v-model="dateStart" class="date-input" />
              <span class="range-sep">至</span>
              <input type="date" v-model="dateEnd" class="date-input" />
            </div>
          </div>
          <div class="form-group">
            <label>时间段</label>
            <div class="time-range">
              <select v-model="timeStart" class="time-select">
                <option v-for="h in 24" :key="h-1" :value="`${String(h-1).padStart(2,'0')}:00`">
                  {{ String(h-1).padStart(2,'0') }}:00
                </option>
              </select>
              <span class="range-sep">至</span>
              <select v-model="timeEnd" class="time-select">
                <option v-for="h in 24" :key="h" :value="`${String(h).padStart(2,'0')}:00`">
                  {{ String(h).padStart(2,'0') }}:00
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-search" @click="searchRecordings">
            <span class="search-icon">🔍</span> 查询录像
          </button>
          <button class="btn-reset" @click="resetSearch">
            <span class="reset-icon">⟳</span> 显示全部
          </button>
        </div>
      </div>
    </div>

    <!-- 录像列表 -->
    <div class="recordings-section">
      <div class="section-header">
        <span class="section-icon">📋</span>
        <span>录像列表</span>
        <span class="result-count">共 {{ displayedRecordings.length }} 条录像</span>
      </div>
      
      <div v-if="displayedRecordings.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>未找到符合条件的录像</p>
        <button class="btn-outline" @click="resetSearch">显示全部录像</button>
      </div>
      
      <div v-else class="recordings-grid">
        <div
          v-for="recording in paginatedRecordings"
          :key="recording.id"
          class="recording-card"
          :class="{ active: currentRecording?.id === recording.id }"
          @click="selectRecording(recording)"
        >
          <div class="recording-thumb">
            <div class="thumb-placeholder">
              <span class="thumb-icon">🎥</span>
            </div>
            <div class="play-overlay" v-if="currentRecording?.id === recording.id">
              <span class="playing-indicator">▶ 播放中</span>
            </div>
          </div>
          <div class="recording-info">
            <div class="recording-name">{{ recording.name }}</div>
            <div class="recording-time">{{ recording.startTime }} - {{ recording.endTime }}</div>
            <div class="recording-duration">时长: {{ recording.duration }}</div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">←</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">→</button>
      </div>
    </div>

    <!-- 播放器区域 -->
    <div class="player-section" v-if="currentRecording">
      <div class="section-header">
        <span class="section-icon">🎬</span>
        <span>视频回放</span>
        <span class="current-file">{{ currentRecording.name }}</span>
      </div>
      
      <div class="video-container" ref="videoContainer">
        <div class="video-wrapper" :class="{ fullscreen: isFullscreen }">
          <!-- 视频播放器区域 - 萤石开放平台回放集成位置 -->
          <div id="ezuikit-player-replay" class="ezuikit-player" ref="playerContainer">
            <div v-if="!isPlayerReady" class="loading-overlay">
              <div class="loading-spinner"></div>
              <p>正在加载录像...</p>
            </div>
            <div v-if="playerError" class="error-overlay">
              <span class="error-icon">⚠️</span>
              <p>录像加载失败，请重试</p>
              <button class="retry-btn" @click="loadRecording">重试</button>
            </div>
          </div>
          <!-- 播放控制栏 -->
          <div class="video-controls">
            <button class="control-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
              {{ isMuted ? '🔇' : '🔊' }}
            </button>
            <div class="progress-bar" ref="progressBar" @click="seekTo">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
            </div>
            <span class="time-display">{{ currentTime }} / {{ totalTime }}</span>
            <button class="control-btn" @click="toggleFullscreen" title="全屏">
              {{ isFullscreen ? '✕' : '⛶' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无录像选择提示 -->
    <div v-else-if="displayedRecordings.length > 0" class="no-selection">
      <div class="selection-prompt">
        <span class="prompt-icon">👆</span>
        <p>请从左侧列表中选择一个录像进行回放</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 设备列表
const devices = ref([
  { id: 'cam_001', name: 'A区 - SPF动物房', location: '实验楼A栋 3F', deviceSerial: 'E12345678', channelNo: 1, online: true },
  { id: 'cam_002', name: 'B区 - 观察室', location: '实验楼B栋 2F', deviceSerial: 'E87654321', channelNo: 1, online: true },
  { id: 'cam_003', name: 'C区 - 隔离区', location: '实验楼C栋 1F', deviceSerial: 'E11223344', channelNo: 1, online: false },
  { id: 'cam_004', name: 'D区 - 手术室', location: '实验楼A栋 5F', deviceSerial: 'E55667788', channelNo: 1, online: true },
  { id: 'cam_005', name: 'E区 - 饲养间', location: '实验楼B栋 1F', deviceSerial: 'E99001122', channelNo: 1, online: true }
])

// 模拟录像数据
const generateMockRecordings = () => {
  const recordings = []
  const devicesList = devices.value.filter(d => d.online)
  const startDate = new Date(2025, 0, 10)
  const endDate = new Date(2025, 0, 20)
  
  for (let i = 1; i <= 45; i++) {
    const device = devicesList[Math.floor(Math.random() * devicesList.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const dateStr = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`
    const hour = Math.floor(Math.random() * 23)
    const startHour = String(hour).padStart(2, '0')
    const endHour = String(hour + 1).padStart(2, '0')
    const duration = Math.floor(Math.random() * 60) + 30 // 30-90分钟
    
    recordings.push({
      id: i,
      deviceId: device.id,
      deviceName: device.name,
      name: `${device.name} - ${dateStr} ${startHour}:00`,
      date: dateStr,
      startTime: `${dateStr} ${startHour}:00:00`,
      endTime: `${dateStr} ${endHour}:00:00`,
      duration: `${Math.floor(duration / 60)}h${duration % 60}m`,
      durationMinutes: duration,
      startHour: hour,
      endHour: hour + 1,
      deviceSerial: device.deviceSerial,
      channelNo: device.channelNo
    })
  }
  // 按时间倒序排序
  recordings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  return recordings
}

const allRecordings = ref(generateMockRecordings())

// 查询条件
const selectedDeviceId = ref('all')
const dateStart = ref('')
const dateEnd = ref('')
const timeStart = ref('00:00')
const timeEnd = ref('23:00')

// 显示的录像（初始显示全部）
const displayedRecordings = ref([...allRecordings.value])

// 当前选中的录像
const currentRecording = ref(null)

// 播放器状态
const isPlayerReady = ref(false)
const playerError = ref(false)
const isPlaying = ref(true)
const isMuted = ref(false)
const isFullscreen = ref(false)
const currentTime = ref('00:00')
const totalTime = ref('00:00')
const progressPercent = ref(0)

// 统计数据
const totalRecordings = computed(() => allRecordings.value.length)
const availableDevices = computed(() => devices.value.filter(d => d.online).length)
const storageDays = ref(30)
const totalDuration = computed(() => {
  const totalMinutes = allRecordings.value.reduce((sum, r) => sum + (r.durationMinutes || 0), 0)
  return Math.round(totalMinutes / 60)
})

// 分页
const currentPage = ref(1)
const pageSize = 6
const totalPages = computed(() => Math.ceil(displayedRecordings.value.length / pageSize))
const paginatedRecordings = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return displayedRecordings.value.slice(start, end)
})

// DOM 引用
const playerContainer = ref(null)
const videoContainer = ref(null)
const progressBar = ref(null)
let playTimer = null

// 查询录像
const searchRecordings = () => {
  let results = [...allRecordings.value]
  
  // 设备筛选
  if (selectedDeviceId.value !== 'all') {
    results = results.filter(r => r.deviceId === selectedDeviceId.value)
  }
  
  // 日期范围筛选
  if (dateStart.value) {
    results = results.filter(r => r.date >= dateStart.value)
  }
  if (dateEnd.value) {
    results = results.filter(r => r.date <= dateEnd.value)
  }
  
  // 时间段筛选
  const startHour = parseInt(timeStart.value.split(':')[0])
  const endHour = parseInt(timeEnd.value.split(':')[0])
  results = results.filter(r => r.startHour >= startHour && r.endHour <= endHour)
  
  displayedRecordings.value = results
  currentPage.value = 1
  
  // 如果当前选中的录像不在结果中，清除选中
  if (currentRecording.value && !results.find(r => r.id === currentRecording.value.id)) {
    currentRecording.value = null
    stopPlayTimer()
  }
  
  // 如果有结果且没有选中任何录像，自动选中第一个
  if (displayedRecordings.value.length > 0 && !currentRecording.value) {
    selectRecording(displayedRecordings.value[0])
  }
}

// 重置查询（显示全部）
const resetSearch = () => {
  selectedDeviceId.value = 'all'
  dateStart.value = ''
  dateEnd.value = ''
  timeStart.value = '00:00'
  timeEnd.value = '23:00'
  displayedRecordings.value = [...allRecordings.value]
  currentPage.value = 1
  
  // 如果有结果且没有选中任何录像，自动选中第一个
  if (displayedRecordings.value.length > 0 && !currentRecording.value) {
    selectRecording(displayedRecordings.value[0])
  }
}

// 选择录像
const selectRecording = (recording) => {
  if (currentRecording.value?.id === recording.id) return
  currentRecording.value = recording
  loadRecording()
}

// 加载录像（萤石开放平台回放集成）
const loadRecording = () => {
  if (!currentRecording.value) return
  
  isPlayerReady.value = false
  playerError.value = false
  progressPercent.value = 0
  currentTime.value = '00:00'
  
  // 模拟加载过程
  setTimeout(() => {
    isPlayerReady.value = true
    isPlaying.value = true
    totalTime.value = formatTime(currentRecording.value.durationMinutes * 60)
    startPlayTimer()
    
    // 实际集成示例代码（取消注释并使用真实配置）:
    /*
    const { EZUIKit } = window
    if (EZUIKit && currentRecording.value) {
      // 回放URL格式: ezopen://{deviceSerial}/{channelNo}?begin={开始时间戳}&end={结束时间戳}&type=1
      const beginTime = new Date(currentRecording.value.startTime).getTime()
      const endTime = new Date(currentRecording.value.endTime).getTime()
      
      const player = new EZUIKit.EZUIKitPlayer({
        id: 'ezuikit-player-replay',
        accessToken: 'YOUR_ACCESS_TOKEN',
        url: `ezopen://${currentRecording.value.deviceSerial}/${currentRecording.value.channelNo}?begin=${beginTime}&end=${endTime}&type=1`,
        width: '100%',
        height: '100%',
        handleSuccess: () => {
          console.log('回放连接成功')
          isPlayerReady.value = true
        },
        handleError: (error) => {
          console.error('回放连接失败:', error)
          playerError.value = true
        }
      })
    } else {
      isPlayerReady.value = true
    }
    */
  }, 1000)
}

// 播放/暂停
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayTimer()
  } else {
    stopPlayTimer()
  }
}

// 静音切换
const toggleMute = () => {
  isMuted.value = !isMuted.value
}

// 进度条点击跳转
const seekTo = (e) => {
  if (!progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  progressPercent.value = Math.min(100, Math.max(0, percent * 100))
  currentTime.value = formatTime((progressPercent.value / 100) * (currentRecording.value?.durationMinutes * 60 || 0))
}

// 播放计时器
const startPlayTimer = () => {
  if (playTimer) clearInterval(playTimer)
  playTimer = setInterval(() => {
    if (isPlaying.value && progressPercent.value < 100) {
      progressPercent.value += 0.5
      currentTime.value = formatTime((progressPercent.value / 100) * (currentRecording.value?.durationMinutes * 60 || 0))
    } else if (progressPercent.value >= 100) {
      // 播放结束
      isPlaying.value = false
      stopPlayTimer()
      progressPercent.value = 0
      currentTime.value = '00:00'
    }
  }, 500)
}

const stopPlayTimer = () => {
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 全屏切换
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

// 组件挂载
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  // 初始显示全部录像，并自动选中第一个
  if (displayedRecordings.value.length > 0) {
    selectRecording(displayedRecordings.value[0])
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  stopPlayTimer()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.video-playback-container {
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

.btn-fullscreen {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #2c5f4a;
  border: 1px solid #e2e8f0;
}

.btn-fullscreen:hover {
  background: white;
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

/* 查询卡片 */
.search-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
  background: rgba(250, 252, 255, 0.8);
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c4b3e;
}

.search-form {
  padding: 1.2rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}

.form-group {
  flex: 1;
  min-width: 180px;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.form-select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.date-range, .time-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input, .time-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  background: white;
  outline: none;
}

.time-select {
  width: 90px;
}

.range-sep {
  color: #8ba0b5;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-search {
  background: #1f5e4a;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-search:hover {
  background: #164b3b;
}

.btn-reset {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: #5e7a93;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-reset:hover {
  background: #e6edf4;
}

/* 录像列表区域 */
.recordings-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(237, 242, 247, 0.5);
}

.section-icon {
  font-size: 1rem;
}

.section-header span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c4b3e;
}

.result-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: #8ba0b5;
  font-weight: normal;
}

.recordings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.recording-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 1rem;
  border: 1px solid rgba(237, 242, 247, 0.5);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.recording-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.recording-card.active {
  border-color: #2c9a6e;
  box-shadow: 0 4px 12px rgba(44, 154, 110, 0.2);
}

.recording-thumb {
  position: relative;
  height: 120px;
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d3748;
}

.thumb-icon {
  font-size: 2.5rem;
  opacity: 0.6;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 154, 110, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.playing-indicator {
  background: rgba(0, 0, 0, 0.7);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  color: white;
}

.recording-info {
  padding: 0.8rem;
}

.recording-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.3rem;
}

.recording-time {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-bottom: 0.2rem;
}

.recording-duration {
  font-size: 0.7rem;
  color: #2c9a6e;
}

/* 播放器区域 */
.player-section {
  margin-top: 0.5rem;
}

.current-file {
  margin-left: auto;
  font-size: 0.75rem;
  color: #8ba0b5;
  font-weight: normal;
}

.video-container {
  position: relative;
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

/* 播放控制栏 */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  z-index: 5;
}

.control-btn {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 0.9rem;
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

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #2c9a6e;
  border-radius: 2px;
  width: 0%;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  background: #2c9a6e;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.time-display {
  font-size: 0.7rem;
  color: white;
  font-family: monospace;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state p {
  color: #8ba0b5;
  margin-bottom: 1rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  font-size: 0.8rem;
  color: #2c5f4a;
  cursor: pointer;
}

.no-selection {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1rem;
}

.selection-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.prompt-icon {
  font-size: 2.5rem;
  opacity: 0.6;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.85rem;
  color: #475569;
}

/* 响应式 */
@media (max-width: 900px) {
  .video-playback-container {
    padding: 1rem;
  }
  .form-row {
    flex-direction: column;
    gap: 0.8rem;
  }
  .recordings-grid {
    grid-template-columns: 1fr;
  }
  .video-controls {
    gap: 0.4rem;
    padding: 0.5rem;
  }
  .control-btn {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  .time-display {
    font-size: 0.6rem;
  }
}
</style>