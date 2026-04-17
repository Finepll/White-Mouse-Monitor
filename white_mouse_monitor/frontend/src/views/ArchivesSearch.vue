<template>
  <div class="advanced-search-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>🔍 高级搜索 · 小鼠档案检索</h1>
        <div class="sub">多维度组合查询，精准定位实验小鼠档案</div>
      </div>
      <button class="btn-reset-large" @click="resetAllFilters">
        <span class="reset-icon">⟳</span> 清空所有条件
      </button>
    </div>

    <!-- 搜索条件卡片 -->
    <div class="search-card">
      <div class="search-grid">
        <!-- 基础信息区 -->
        <div class="search-section">
          <div class="section-title">📝 基础信息</div>
          <div class="form-row">
            <div class="form-group">
              <label>小鼠编号/档案ID</label>
              <input
                type="text"
                v-model="filters.keyword"
                class="form-input"
                placeholder="支持模糊搜索"
              />
            </div>
            <div class="form-group">
              <label>品系</label>
              <select v-model="filters.strain" class="form-select">
                <option value="all">全部品系</option>
                <option value="BALB/c">BALB/c</option>
                <option value="C57BL/6">C57BL/6</option>
                <option value="ICR">ICR</option>
                <option value="KM">KM小鼠</option>
                <option value="NOD/SCID">NOD/SCID</option>
              </select>
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="filters.gender" class="form-select">
                <option value="all">不限</option>
                <option value="♂ 雄性">雄性</option>
                <option value="♀ 雌性">雌性</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 健康状态区 -->
        <div class="search-section">
          <div class="section-title">💚 健康状态</div>
          <div class="status-buttons">
            <button
              v-for="status in statusOptions"
              :key="status.value"
              class="status-btn"
              :class="{ active: filters.healthStatus === status.value }"
              @click="filters.healthStatus = status.value"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <!-- 体重范围区 -->
        <div class="search-section">
          <div class="section-title">⚖️ 体重范围 (g)</div>
          <div class="range-inputs">
            <div class="range-group">
              <input
                type="number"
                v-model.number="filters.weightMin"
                class="range-input"
                placeholder="最小值"
                step="0.5"
              />
              <span class="range-sep">—</span>
              <input
                type="number"
                v-model.number="filters.weightMax"
                class="range-input"
                placeholder="最大值"
                step="0.5"
              />
            </div>
          </div>
        </div>

        <!-- 日期范围区 -->
        <div class="search-section">
          <div class="section-title">📅 出生日期范围</div>
          <div class="date-range">
            <input type="date" v-model="filters.birthStart" class="date-input" />
            <span class="range-sep">至</span>
            <input type="date" v-model="filters.birthEnd" class="date-input" />
          </div>
        </div>

        <!-- 更多筛选 -->
        <div class="search-section">
          <div class="section-title">🏷️ 其他条件</div>
          <div class="form-row">
            <div class="form-group">
              <label>备注关键词</label>
              <input
                type="text"
                v-model="filters.remarkKeyword"
                class="form-input"
                placeholder="健康记录、观察备注..."
              />
            </div>
            <div class="form-group">
              <label>最近检查日期</label>
              <select v-model="filters.checkRange" class="form-select">
                <option value="all">不限时间</option>
                <option value="7">最近7天</option>
                <option value="30">最近30天</option>
                <option value="90">最近90天</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="search-actions">
        <button class="btn-search" @click="performSearch">
          <span class="search-icon">🔍</span> 立即搜索
        </button>
        <button class="btn-secondary" @click="resetFilters">
          <span class="reset-icon">⟳</span> 重置
        </button>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div class="result-header" v-if="hasSearched">
      <div class="result-stats">
        <span class="result-count">共找到 <strong>{{ filteredResults.length }}</strong> 条档案</span>
        <span class="result-time" v-if="lastSearchTime">耗时 {{ searchDuration }}ms</span>
      </div>
      <div class="result-view-toggle">
        <button
          class="view-btn"
          :class="{ active: viewMode === 'table' }"
          @click="viewMode = 'table'"
        >
          📋 表格视图
        </button>
        <button
          class="view-btn"
          :class="{ active: viewMode === 'card' }"
          @click="viewMode = 'card'"
        >
          🃏 卡片视图
        </button>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table' && hasSearched" class="table-wrapper">
      <div v-if="filteredResults.length === 0" class="empty-result">
        <span class="empty-emoji">🔍</span>
        <p>没有找到匹配的档案，试试调整搜索条件~</p>
      </div>
      <table v-else class="result-table">
        <thead>
          <tr>
            <th>档案ID</th>
            <th>小鼠编号</th>
            <th>品系</th>
            <th>性别</th>
            <th>出生日期</th>
            <th>健康状况</th>
            <th>体重(g)</th>
            <th>最近检查</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedResults" :key="item.id">
            <td class="mono-text">{{ item.archiveId }}</td>
            <td>
              <span class="mouse-badge">🐭 {{ item.mouseCode }}</span>
              <div class="mouse-name">{{ item.name }}</div>
            </td>
            <td>{{ item.strain }}</td>
            <td>{{ item.gender }}</td>
            <td>{{ item.birthDate }}</td>
            <td v-html="getStatusBadge(item.healthStatus)"></td>
            <td><strong>{{ item.weight }}</strong> g</td>
            <td>{{ item.lastCheck || '—' }}</td>
            <td>
              <button class="detail-btn" @click="viewDetail(item)">查看</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination" v-if="filteredResults.length > 0">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ←
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          →
        </button>
      </div>
    </div>

    <!-- 卡片视图 -->
    <div v-if="viewMode === 'card' && hasSearched" class="card-grid">
      <div v-if="filteredResults.length === 0" class="empty-result">
        <span class="empty-emoji">🔍</span>
        <p>没有找到匹配的档案</p>
      </div>
      <div
        v-for="item in paginatedResults"
        :key="item.id"
        class="result-card"
      >
        <div class="card-header">
          <div class="card-icon" :class="getHealthClass(item.healthStatus)">
            🐭
          </div>
          <div class="card-info">
            <div class="card-code">{{ item.mouseCode }}</div>
            <div class="card-name">{{ item.name }}</div>
          </div>
          <div class="card-status" v-html="getStatusBadge(item.healthStatus)"></div>
        </div>
        <div class="card-body">
          <div class="card-row">
            <span class="card-label">档案ID</span>
            <span class="card-value mono-text">{{ item.archiveId }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">品系</span>
            <span class="card-value">{{ item.strain }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">性别</span>
            <span class="card-value">{{ item.gender }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">出生日期</span>
            <span class="card-value">{{ item.birthDate }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">体重</span>
            <span class="card-value"><strong>{{ item.weight }}</strong> g</span>
          </div>
          <div class="card-row">
            <span class="card-label">备注</span>
            <span class="card-value remark">{{ item.remark || '—' }}</span>
          </div>
        </div>
        <div class="card-footer">
          <button class="detail-link" @click="viewDetail(item)">查看详情 →</button>
        </div>
      </div>

      <!-- 卡片视图分页 -->
      <div class="pagination" v-if="filteredResults.length > 0">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ←
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          →
        </button>
      </div>
    </div>

    <!-- 未搜索状态 -->
    <div v-if="!hasSearched" class="welcome-state">
      <div class="welcome-icon">🔎</div>
      <h3>开始检索小鼠档案</h3>
      <p>填写上方筛选条件，点击「立即搜索」查看结果</p>
    </div>

    <!-- 详情模态框 -->
    <div v-if="detailModalVisible" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-container detail-modal">
        <div class="modal-header">
          <h3>📄 档案详情</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedItem">
          <div class="detail-grid">
            <div class="detail-item">
              <label>档案ID</label>
              <span>{{ selectedItem.archiveId }}</span>
            </div>
            <div class="detail-item">
              <label>小鼠编号</label>
              <span>{{ selectedItem.mouseCode }}</span>
            </div>
            <div class="detail-item">
              <label>名称</label>
              <span>{{ selectedItem.name }}</span>
            </div>
            <div class="detail-item">
              <label>品系</label>
              <span>{{ selectedItem.strain }}</span>
            </div>
            <div class="detail-item">
              <label>性别</label>
              <span>{{ selectedItem.gender }}</span>
            </div>
            <div class="detail-item">
              <label>出生日期</label>
              <span>{{ selectedItem.birthDate }}</span>
            </div>
            <div class="detail-item">
              <label>健康状况</label>
              <span v-html="getStatusBadge(selectedItem.healthStatus)"></span>
            </div>
            <div class="detail-item">
              <label>体重</label>
              <span>{{ selectedItem.weight }} g</span>
            </div>
            <div class="detail-item full-width">
              <label>备注描述</label>
              <span class="remark-text">{{ selectedItem.remark || '无' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>最近检查</label>
              <span>{{ selectedItem.lastCheck || '未记录' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 模拟小鼠档案数据（与档案列表保持一致的数据源）
const generateMockData = () => {
  const strains = ['BALB/c', 'C57BL/6', 'ICR', 'KM', 'NOD/SCID']
  const statuses = ['healthy', 'observation', 'warning']
  const genders = ['♂ 雄性', '♀ 雌性']
  const firstNames = ['米粒', '豆豆', '雪球', '灰灰', '绒绒', '团团', '圆圆', '芝麻', '布丁', '年糕']

  const data = []
  const startDate = new Date(2023, 0, 1)
  const endDate = new Date(2025, 3, 1)

  for (let i = 1; i <= 48; i++) {
    const id = `M-${String(i).padStart(3, '0')}`
    const name = firstNames[Math.floor(Math.random() * firstNames.length)] + (Math.floor(Math.random() * 100) + 1)
    const strain = strains[Math.floor(Math.random() * strains.length)]
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
    const birth = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`
    const gender = genders[Math.floor(Math.random() * genders.length)]
    let status = statuses[Math.floor(Math.random() * statuses.length)]
    if (i % 7 === 0) status = 'warning'
    if (i % 5 === 0) status = 'observation'

    const weight = (18 + Math.random() * 14).toFixed(1)
    const remark = status === 'warning' ? '活动减少，食欲下降，建议隔离观察' : (status === 'observation' ? '定期复检中，体重稳定' : '状态活跃，进食正常')
    data.push({
      id: i,
      archiveId: `ARC-${2024000 + i}`,
      mouseCode: `${strain.substring(0, 2)}-${id}`,
      name: name,
      strain: strain,
      birthDate: birth,
      gender: gender,
      healthStatus: status,
      weight: parseFloat(weight),
      remark: remark,
      lastCheck: `2025-${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 28) + 1}`
    })
  }
  data[0].healthStatus = 'warning'
  data[0].remark = '轻度脱水，加强观察'
  data[2].healthStatus = 'observation'
  data[2].weight = 22.3
  data[5].healthStatus = 'healthy'
  return data
}

const allArchives = ref(generateMockData())

// 筛选条件
const filters = ref({
  keyword: '',
  strain: 'all',
  gender: 'all',
  healthStatus: 'all',
  weightMin: null,
  weightMax: null,
  birthStart: '',
  birthEnd: '',
  remarkKeyword: '',
  checkRange: 'all'
})

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'healthy', label: '✓ 健康' },
  { value: 'observation', label: '🔄 观察中' },
  { value: 'warning', label: '⚠️ 异常' }
]

// 搜索结果
const filteredResults = ref([])
const hasSearched = ref(false)
const lastSearchTime = ref(null)
const searchDuration = ref(0)

// 视图模式
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = 10

// 详情模态框
const detailModalVisible = ref(false)
const selectedItem = ref(null)

// 计算分页
const totalPages = computed(() => Math.ceil(filteredResults.value.length / pageSize))
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredResults.value.slice(start, end)
})

// 状态徽章
const getStatusBadge = (status) => {
  if (status === 'healthy') return '<span class="badge healthy">✓ 健康</span>'
  if (status === 'observation') return '<span class="badge observation">🔄 观察中</span>'
  if (status === 'warning') return '<span class="badge warning">⚠️ 异常预警</span>'
  return '<span class="badge">未知</span>'
}

const getHealthClass = (status) => {
  if (status === 'healthy') return 'health-healthy'
  if (status === 'observation') return 'health-obs'
  return 'health-warning'
}

// 执行搜索
const performSearch = () => {
  const startTime = performance.now()
  let results = [...allArchives.value]

  const f = filters.value

  // 关键词搜索（编号/档案ID）
  if (f.keyword.trim()) {
    const kw = f.keyword.toLowerCase()
    results = results.filter(item =>
      item.mouseCode.toLowerCase().includes(kw) ||
      item.archiveId.toLowerCase().includes(kw)
    )
  }

  // 品系
  if (f.strain !== 'all') {
    results = results.filter(item => item.strain === f.strain)
  }

  // 性别
  if (f.gender !== 'all') {
    results = results.filter(item => item.gender === f.gender)
  }

  // 健康状态
  if (f.healthStatus !== 'all') {
    results = results.filter(item => item.healthStatus === f.healthStatus)
  }

  // 体重范围
  if (f.weightMin !== null && f.weightMin !== '') {
    results = results.filter(item => item.weight >= f.weightMin)
  }
  if (f.weightMax !== null && f.weightMax !== '') {
    results = results.filter(item => item.weight <= f.weightMax)
  }

  // 出生日期范围
  if (f.birthStart) {
    results = results.filter(item => item.birthDate >= f.birthStart)
  }
  if (f.birthEnd) {
    results = results.filter(item => item.birthDate <= f.birthEnd)
  }

  // 备注关键词
  if (f.remarkKeyword.trim()) {
    const rk = f.remarkKeyword.toLowerCase()
    results = results.filter(item => item.remark && item.remark.toLowerCase().includes(rk))
  }

  // 最近检查日期范围
  if (f.checkRange !== 'all') {
    const days = parseInt(f.checkRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    results = results.filter(item => {
      if (!item.lastCheck) return false
      const checkDate = new Date(item.lastCheck)
      return checkDate >= cutoffDate
    })
  }

  filteredResults.value = results
  hasSearched.value = true
  currentPage.value = 1
  lastSearchTime.value = new Date()
  searchDuration.value = Math.round(performance.now() - startTime)
}

// 重置筛选（保留搜索框清空，但不清空搜索结果）
const resetFilters = () => {
  filters.value = {
    keyword: '',
    strain: 'all',
    gender: 'all',
    healthStatus: 'all',
    weightMin: null,
    weightMax: null,
    birthStart: '',
    birthEnd: '',
    remarkKeyword: '',
    checkRange: 'all'
  }
}

// 清空所有条件并重置搜索
const resetAllFilters = () => {
  resetFilters()
  hasSearched.value = false
  filteredResults.value = []
  currentPage.value = 1
}

// 查看详情
const viewDetail = (item) => {
  selectedItem.value = item
  detailModalVisible.value = true
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedItem.value = null
}

// 监听分页变化，滚动到顶部
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.advanced-search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #f1f1f1;
  min-height: 100%;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.8rem;
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

.btn-reset-large {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #5e7a93;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-large:hover {
  background: #e6edf4;
  border-color: #cbd5e1;
}

/* 搜索卡片 */
.search-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.search-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-section {
  border-bottom: 1px solid #f0f3f9;
  padding-bottom: 1rem;
}

.search-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c4b3e;
  margin-bottom: 0.8rem;
  letter-spacing: 0.3px;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 160px;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  color: #6b85a0;
  margin-bottom: 0.3rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  font-family: inherit;
  transition: all 0.2s;
  outline: none;
  background: white;
}

.form-input:focus,
.form-select:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.08);
}

/* 状态按钮组 */
.status-buttons {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.status-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  background: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}

.status-btn:hover {
  border-color: #2c9a6e;
  background: #f8fafc;
}

.status-btn.active {
  background: #1f5e4a;
  border-color: #1f5e4a;
  color: white;
}

/* 范围输入 */
.range-inputs {
  max-width: 320px;
}

.range-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  outline: none;
}

.range-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.08);
}

.range-sep {
  color: #8ba0b5;
  font-size: 0.85rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-input {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
}

.date-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.08);
}

/* 搜索操作按钮 */
.search-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eef2f6;
}

.btn-search {
  background: #1f5e4a;
  border: none;
  padding: 0.7rem 1.8rem;
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #164b3b;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.7rem 1.4rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #2c5f4a;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* 结果头部 */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.result-stats {
  font-size: 0.9rem;
  color: #475569;
}

.result-count strong {
  font-size: 1.2rem;
  color: #1f5e4a;
}

.result-time {
  font-size: 0.75rem;
  color: #8ba0b5;
  margin-left: 0.8rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.4rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  background: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background: #eef6f2;
  border-color: #bdd9cc;
  color: #1f5e4a;
}

/* 表格视图 */
.table-wrapper {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 800px;
}

.result-table th {
  text-align: left;
  padding: 1rem;
  background: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  color: #2c4b3e;
}

.result-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f0f3f9;
  color: #2d3e50;
}

.mouse-badge {
  font-weight: 500;
}

.mouse-name {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
}

.mono-text {
  font-family: monospace;
  font-size: 0.8rem;
}

.detail-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  cursor: pointer;
  color: #2c5f4a;
  transition: all 0.2s;
}

.detail-btn:hover {
  background: #eef6f2;
  border-color: #2c9a6e;
}

/* 卡片视图 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.result-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #edf2f7;
  overflow: hidden;
  transition: all 0.2s;
}

.result-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: #fafcff;
  border-bottom: 1px solid #f0f3f9;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: #e8f0fe;
}

.card-icon.health-healthy {
  background: #e0f2e9;
}

.card-icon.health-obs {
  background: #fff0e0;
}

.card-icon.health-warning {
  background: #ffe8e6;
}

.card-info {
  flex: 1;
}

.card-code {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.card-name {
  font-size: 0.7rem;
  color: #8ba0b5;
}

.card-body {
  padding: 0.8rem 1rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.8rem;
  border-bottom: 1px dashed #f0f3f9;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  color: #6b85a0;
}

.card-value {
  color: #2d3e50;
}

.card-value.remark {
  max-width: 180px;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  padding: 0.8rem 1rem;
  border-top: 1px solid #f0f3f9;
  text-align: right;
}

.detail-link {
  background: none;
  border: none;
  color: #2c9a6e;
  cursor: pointer;
  font-size: 0.8rem;
}

/* 徽章样式 */
.badge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 500;
}

.badge.healthy {
  background: #e0f2e9;
  color: #1f7840;
}

.badge.observation {
  background: #fff0e0;
  color: #c26b2e;
}

.badge.warning {
  background: #ffe8e6;
  color: #bc4e2c;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.page-btn {
  background: white;
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

/* 欢迎状态 & 空状态 */
.welcome-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid #edf2f7;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-result {
  text-align: center;
  padding: 3rem;
  color: #8ba0b5;
}

.empty-emoji {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.8rem;
}

/* 详情模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
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
  max-width: 560px;
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
  padding: 1rem 1.5rem;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b85a0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 0.9rem;
  color: #1e293b;
}

.remark-text {
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 680px) {
  .advanced-search-container {
    padding: 1rem;
  }
  .form-row {
    flex-direction: column;
  }
  .form-group {
    min-width: auto;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>