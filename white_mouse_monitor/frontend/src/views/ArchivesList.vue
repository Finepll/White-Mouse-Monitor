<template>
  <div class="archives-container">
    <!-- 头部信息 -->
    <div class="page-header">
      <h1>📋 档案管理 · 小鼠信息库</h1>
      <div class="sub">记录每一只实验小鼠的生命轨迹 & 健康档案</div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">{{ totalCount }}</div>
        <div class="stat-label">总档案数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ healthyCount }}</div>
        <div class="stat-label">健康个体</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ observationCount }}</div>
        <div class="stat-label">观察中</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ warningCount }}</div>
        <div class="stat-label">异常预警</div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-area">
        <div class="search-input-wrapper">
          <i>🔍</i>
          <input
            type="text"
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索编号、品系或备注..."
          />
        </div>
      </div>
      <div class="filter-group">
        <select v-model="strainFilter" class="filter-select">
          <option value="all">全部品系</option>
          <option value="BALB/c">BALB/c</option>
          <option value="C57BL/6">C57BL/6</option>
          <option value="ICR">ICR</option>
          <option value="KM">KM小鼠</option>
        </select>
        <select v-model="statusFilter" class="filter-select">
          <option value="all">全部状态</option>
          <option value="healthy">健康</option>
          <option value="observation">观察中</option>
          <option value="warning">异常预警</option>
        </select>
        <button class="btn-reset" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <!-- 档案列表表格 -->
    <div class="table-wrapper">
      <table class="archives-table">
        <thead>
          <tr>
            <th>档案ID</th>
            <th>小鼠编号</th>
            <th>品系</th>
            <th>出生日期</th>
            <th>性别</th>
            <th>健康状况</th>
            <th>最近体重(g)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0" class="empty-row">
            <td colspan="8">📭 没有找到匹配的档案，试试调整筛选条件~</td>
          </tr>
          <tr v-for="item in paginatedData" :key="item.id">
            <td style="font-family: monospace;">{{ item.archiveId }}</td>
            <td>
              <span class="mouse-icon-emoji">🐭</span> {{ item.mouseCode }} ({{ item.name }})
            </td>
            <td>{{ item.strain }}</td>
            <td>{{ item.birthDate }}</td>
            <td>{{ item.gender }}</td>
            <td v-html="getStatusBadge(item.healthStatus)"></td>
            <td>{{ item.weight }} g</td>
            <td class="action-buttons">
              <button class="btn-icon" title="查看详情" @click="handleAction('查看详情', item.id)">👁️</button>
              <button class="btn-icon" title="编辑档案" @click="handleAction('编辑档案', item.id)">✏️</button>
              <button class="btn-icon" title="健康记录" @click="handleAction('健康记录', item.id)">📊</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页组件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        :class="{ disabled: currentPage === 1 }"
        @click="prevPage"
        :disabled="currentPage === 1"
      >
        ← 上一页
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        class="page-btn"
        :class="{ disabled: currentPage === totalPages }"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >
        下一页 →
      </button>
      <span style="margin-left: 12px; font-size: 0.75rem; color: #7c8ea0">
        共 {{ filteredArchives.length }} 条记录
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 生成模拟数据
const generateMockData = () => {
  const strains = ['BALB/c', 'C57BL/6', 'ICR', 'KM']
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
    const remark = status === 'warning' ? '活动减少，食欲下降' : (status === 'observation' ? '定期复检中' : '状态活跃')
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
  // 增加几个具体特征
  data[0].healthStatus = 'warning'
  data[0].remark = '轻度脱水，加强观察'
  data[2].healthStatus = 'observation'
  data[2].weight = 22.3
  data[5].healthStatus = 'healthy'
  return data
}

// 数据
const allArchives = ref(generateMockData())
const searchKeyword = ref('')
const strainFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const rowsPerPage = 10

// 计算统计
const totalCount = computed(() => allArchives.value.length)
const healthyCount = computed(() => allArchives.value.filter(a => a.healthStatus === 'healthy').length)
const observationCount = computed(() => allArchives.value.filter(a => a.healthStatus === 'observation').length)
const warningCount = computed(() => allArchives.value.filter(a => a.healthStatus === 'warning').length)

// 筛选后的数据
const filteredArchives = computed(() => {
  let result = [...allArchives.value]
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (keyword) {
    result = result.filter(item =>
      item.mouseCode.toLowerCase().includes(keyword) ||
      item.strain.toLowerCase().includes(keyword) ||
      item.remark.toLowerCase().includes(keyword) ||
      item.archiveId.toLowerCase().includes(keyword)
    )
  }
  if (strainFilter.value !== 'all') {
    result = result.filter(item => item.strain === strainFilter.value)
  }
  if (statusFilter.value !== 'all') {
    result = result.filter(item => item.healthStatus === statusFilter.value)
  }
  return result
})

// 分页数据
const totalPages = computed(() => Math.ceil(filteredArchives.value.length / rowsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  const end = start + rowsPerPage
  return filteredArchives.value.slice(start, end)
})

// 可见页码
const visiblePages = computed(() => {
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 状态徽章
const getStatusBadge = (status) => {
  if (status === 'healthy') return '<span class="status-badge healthy">✓ 健康</span>'
  if (status === 'observation') return '<span class="status-badge observation">🔄 观察中</span>'
  if (status === 'warning') return '<span class="status-badge warning">⚠️ 异常预警</span>'
  return '<span class="status-badge">未知</span>'
}

// 操作方法
const resetFilters = () => {
  searchKeyword.value = ''
  strainFilter.value = 'all'
  statusFilter.value = 'all'
  currentPage.value = 1
}

const goToPage = (page) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const handleAction = (action, id) => {
  alert(`✨ 演示模式\n您点击了「${action}」\n档案ID: ${id}\n实际项目中将跳转至详情/编辑页面。`)
}

// 监听筛选变化，重置页码
import { watch } from 'vue'
watch([searchKeyword, strainFilter, statusFilter], () => {
  currentPage.value = 1
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.archives-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

/* 页面头部 */
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  background: linear-gradient(135deg, #2c3e4e, #1a4d3e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.3px;
  display: inline-block;
}

.page-header .sub {
  color: #5b6e8c;
  font-size: 0.9rem;
  margin-top: 0.3rem;
  border-left: 3px solid #2c9a6e;
  padding-left: 0.75rem;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 1.2rem 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
  border: 1px solid #eef2f6;
  text-align: center;
}

.stat-card:hover {
  border-color: #cbdde6;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f5e4a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #5e7a93;
  margin-top: 0.4rem;
}

/* 工具栏 */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.8rem;
}

.search-area {
  flex: 2;
  min-width: 200px;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 2;
  position: relative;
}

.search-input-wrapper i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8aa0b5;
  font-style: normal;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.7rem 0.7rem 0.7rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 60px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}

.search-input:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
}

.filter-group {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.6rem 2rem 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 40px;
  background: white;
  font-size: 0.85rem;
  color: #1e2a3e;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235e7a93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
}

.btn-reset {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #2c5f4a;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e6edf4;
  border-color: #cbd5e1;
}

/* 表格 */
.table-wrapper {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #edf2f7;
  overflow-x: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.archives-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 680px;
}

.archives-table th {
  text-align: left;
  padding: 1rem 1rem;
  background-color: #fafcff;
  border-bottom: 1px solid #eef2f8;
  font-weight: 600;
  color: #2c4b3e;
  font-size: 0.85rem;
}

.archives-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #f0f3f9;
  color: #2d3e50;
  vertical-align: middle;
}

.archives-table tr:hover td {
  background-color: #fafefb;
}

/* 状态徽章 */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 500;
  background: #eef2ff;
  color: #2c6b5c;
}

.status-badge.healthy {
  background: #e0f2e9;
  color: #1f7840;
}

.status-badge.observation {
  background: #fff0e0;
  color: #c26b2e;
}

.status-badge.warning {
  background: #ffe8e6;
  color: #bc4e2c;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  transition: all 0.2s;
  color: #5d7f96;
}

.btn-icon:hover {
  background: #f0f4f9;
  color: #2c9a6e;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.page-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #2c4b3e;
}

.page-btn.active {
  background: #eef6f2;
  border-color: #bdd9cc;
  color: #1e6f52;
  font-weight: 500;
}

.page-btn:hover:not(.disabled) {
  background: #eef2f5;
  border-color: #cbdce9;
}

.page-btn.disabled,
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-row td {
  text-align: center;
  padding: 2rem;
  color: #8ba0b5;
}

.mouse-icon-emoji {
  font-size: 0.9rem;
  margin-right: 4px;
}

/* 滚动条 */
.table-wrapper::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbdde6;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 680px) {
  .archives-container {
    padding: 1rem;
  }
  .stats-grid {
    gap: 0.7rem;
  }
  .stat-number {
    font-size: 1.5rem;
  }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-group {
    justify-content: flex-start;
  }
}
</style>