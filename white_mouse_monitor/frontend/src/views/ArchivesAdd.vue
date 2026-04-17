<template>
  <div class="category-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1>🏷️ 分类管理 · 小鼠品系库</h1>
        <div class="sub">管理实验小鼠的品系分类与基础信息</div>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <span class="btn-icon">+</span> 新建分类
      </button>
    </div>

    <!-- 统计摘要卡片 -->
    <div class="stats-row">
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ categories.length }}</div>
        <div class="stat-label-mini">总品系数</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ activeCount }}</div>
        <div class="stat-label-mini">启用中</div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-number-mini">{{ totalMiceCount }}</div>
        <div class="stat-label-mini">关联小鼠</div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          v-model="searchKeyword"
          class="search-input-clean"
          placeholder="搜索品系名称或描述..."
        />
      </div>
    </div>

    <!-- 分类卡片网格 -->
    <div class="category-grid" v-if="filteredCategories.length > 0">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="category-card"
        :class="{ inactive: !category.isActive }"
      >
        <div class="card-header">
          <div class="category-icon" :style="{ backgroundColor: category.color || '#e8f0fe' }">
            <span>{{ category.icon || '🐭' }}</span>
          </div>
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <span class="category-code">{{ category.code }}</span>
          </div>
          <div class="card-actions">
            <button class="icon-btn" @click="openEditModal(category)" title="编辑">
              ✏️
            </button>
            <button class="icon-btn" @click="confirmDelete(category)" title="删除">
              🗑️
            </button>
          </div>
        </div>
        <div class="card-body">
          <p class="category-desc">{{ category.description || '暂无描述' }}</p>
          <div class="category-meta">
            <span class="meta-tag">
              <span class="meta-dot" :class="{ active: category.isActive }"></span>
              {{ category.isActive ? '启用' : '停用' }}
            </span>
            <span class="meta-tag">📊 {{ category.mouseCount || 0 }} 只小鼠</span>
            <span class="meta-tag" v-if="category.createdAt">📅 {{ formatDate(category.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span class="empty-emoji">📂</span>
      <p>暂无分类数据</p>
      <button class="btn-outline" @click="openCreateModal">创建第一个分类</button>
    </div>

    <!-- 新建/编辑模态框 -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEditMode ? '编辑分类' : '新建分类' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>品系名称 <span class="required">*</span></label>
            <input
              type="text"
              v-model="formData.name"
              class="form-input"
              placeholder="例如：C57BL/6"
              maxlength="50"
            />
          </div>
          <div class="form-group">
            <label>分类编码</label>
            <input
              type="text"
              v-model="formData.code"
              class="form-input"
              placeholder="例如：C57"
              maxlength="20"
            />
            <span class="form-hint">唯一标识码，建议使用大写字母+数字</span>
          </div>
          <div class="form-row">
            <div class="form-group half">
              <label>图标表情</label>
              <input
                type="text"
                v-model="formData.icon"
                class="form-input"
                placeholder="🐭"
                maxlength="4"
              />
            </div>
            <div class="form-group half">
              <label>主题颜色</label>
              <div class="color-wrapper">
                <input
                  type="color"
                  v-model="formData.color"
                  class="color-picker"
                />
                <input
                  type="text"
                  v-model="formData.color"
                  class="color-text"
                  placeholder="#e8f0fe"
                />
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              rows="3"
              placeholder="品系特征、来源等信息..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.isActive" />
              <span>启用此分类</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">取消</button>
          <button class="btn-primary" @click="saveCategory">保存</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="deleteConfirmVisible" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal-container delete-modal">
        <div class="modal-header">
          <h3>确认删除</h3>
        </div>
        <div class="modal-body">
          <p>确定要删除分类 <strong>{{ deleteTarget?.name }}</strong> 吗？</p>
          <p class="warning-text" v-if="deleteTarget?.mouseCount > 0">
            ⚠️ 该分类下关联了 {{ deleteTarget.mouseCount }} 只小鼠，删除后这些小鼠将变为"未分类"。
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDeleteConfirm">取消</button>
          <button class="btn-danger" @click="performDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 分类数据类型
const generateId = () => Date.now() + Math.random().toString(36).substr(2, 6)

// 初始分类数据
const getInitialCategories = () => [
  {
    id: '1',
    name: 'BALB/c',
    code: 'BALB',
    icon: '🐭',
    color: '#e8f0fe',
    description: '白化品系，广泛应用于免疫学和肿瘤学研究',
    isActive: true,
    mouseCount: 12,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'C57BL/6',
    code: 'C57',
    icon: '🐁',
    color: '#e6f7ec',
    description: '黑色品系，常用于遗传学和神经科学研究',
    isActive: true,
    mouseCount: 24,
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'ICR',
    code: 'ICR',
    icon: '🐭',
    color: '#fff0e6',
    description: '封闭群，繁殖力强，多用于毒理学研究',
    isActive: true,
    mouseCount: 8,
    createdAt: '2024-02-10'
  },
  {
    id: '4',
    name: 'KM小鼠',
    code: 'KM',
    icon: '🐭',
    color: '#f3e8ff',
    description: '昆明小鼠，国内广泛使用的封闭群',
    isActive: false,
    mouseCount: 3,
    createdAt: '2024-03-05'
  },
  {
    id: '5',
    name: 'NOD/SCID',
    code: 'NOD',
    icon: '🐭',
    color: '#ffe8e6',
    description: '免疫缺陷小鼠，适用于肿瘤移植模型',
    isActive: true,
    mouseCount: 6,
    createdAt: '2024-04-12'
  }
]

const categories = ref(getInitialCategories())
const searchKeyword = ref('')

// 模态框状态
const modalVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)
const formData = ref({
  name: '',
  code: '',
  icon: '🐭',
  color: '#e8f0fe',
  description: '',
  isActive: true
})

// 删除确认
const deleteConfirmVisible = ref(false)
const deleteTarget = ref(null)

// 计算属性
const activeCount = computed(() => categories.value.filter(c => c.isActive).length)
const totalMiceCount = computed(() => categories.value.reduce((sum, c) => sum + (c.mouseCount || 0), 0))

const filteredCategories = computed(() => {
  if (!searchKeyword.value.trim()) return categories.value
  const keyword = searchKeyword.value.toLowerCase()
  return categories.value.filter(c =>
    c.name.toLowerCase().includes(keyword) ||
    c.code.toLowerCase().includes(keyword) ||
    (c.description && c.description.toLowerCase().includes(keyword))
  )
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr
}

// 打开新建模态框
const openCreateModal = () => {
  isEditMode.value = false
  editId.value = null
  formData.value = {
    name: '',
    code: '',
    icon: '🐭',
    color: '#e8f0fe',
    description: '',
    isActive: true
  }
  modalVisible.value = true
}

// 打开编辑模态框
const openEditModal = (category) => {
  isEditMode.value = true
  editId.value = category.id
  formData.value = {
    name: category.name,
    code: category.code,
    icon: category.icon || '🐭',
    color: category.color || '#e8f0fe',
    description: category.description || '',
    isActive: category.isActive
  }
  modalVisible.value = true
}

// 关闭模态框
const closeModal = () => {
  modalVisible.value = false
  isEditMode.value = false
  editId.value = null
}

// 保存分类
const saveCategory = () => {
  if (!formData.value.name.trim()) {
    alert('请填写品系名称')
    return
  }

  const today = new Date().toISOString().slice(0, 10)
  const newCategory = {
    id: isEditMode.value ? editId.value : generateId(),
    name: formData.value.name.trim(),
    code: formData.value.code.trim().toUpperCase(),
    icon: formData.value.icon || '🐭',
    color: formData.value.color,
    description: formData.value.description.trim(),
    isActive: formData.value.isActive,
    mouseCount: 0,
    createdAt: isEditMode.value ? categories.value.find(c => c.id === editId.value)?.createdAt : today
  }

  if (isEditMode.value) {
    const index = categories.value.findIndex(c => c.id === editId.value)
    if (index !== -1) {
      // 保留原有的 mouseCount
      newCategory.mouseCount = categories.value[index].mouseCount || 0
      categories.value[index] = newCategory
    }
  } else {
    categories.value.push(newCategory)
  }

  closeModal()
}

// 确认删除
const confirmDelete = (category) => {
  deleteTarget.value = category
  deleteConfirmVisible.value = true
}

const closeDeleteConfirm = () => {
  deleteConfirmVisible.value = false
  deleteTarget.value = null
}

const performDelete = () => {
  if (deleteTarget.value) {
    const index = categories.value.findIndex(c => c.id === deleteTarget.value.id)
    if (index !== -1) {
      categories.value.splice(index, 1)
    }
  }
  closeDeleteConfirm()
}

// 重置搜索（可选，保留）
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.category-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
  letter-spacing: -0.3px;
}

.sub {
  color: #5b6e8c;
  font-size: 0.9rem;
  margin-top: 0.3rem;
  border-left: 3px solid #2c9a6e;
  padding-left: 0.75rem;
}

/* 按钮 */
.btn-primary {
  background: #1f5e4a;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #164b3b;
  transform: translateY(-1px);
}

.btn-secondary {
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

.btn-secondary:hover {
  background: #e6edf4;
}

.btn-outline {
  background: transparent;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  color: #2c5f4a;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-outline:hover {
  background: #eef2f5;
}

.btn-danger {
  background: #e25c3e;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #c94a2e;
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-card-mini {
  background: white;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  border: 1px solid #eef2f6;
  min-width: 120px;
  text-align: center;
}

.stat-number-mini {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f5e4a;
}

.stat-label-mini {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #5e7a93;
  margin-top: 0.2rem;
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 1.8rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.6;
}

.search-input-clean {
  width: 100%;
  padding: 0.7rem 0.7rem 0.7rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 60px;
  font-size: 0.9rem;
  background: white;
  outline: none;
  transition: all 0.2s;
}

.search-input-clean:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.1);
}

/* 卡片网格 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.category-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #edf2f7;
  transition: all 0.2s;
  overflow: hidden;
}

.category-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
  border-color: #dce5ec;
}

.category-card.inactive {
  opacity: 0.7;
  background: #fafbfc;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1rem 0.5rem 1rem;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  background: #e8f0fe;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.category-code {
  font-size: 0.7rem;
  color: #8ba0b5;
  font-family: monospace;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 20px;
}

.card-actions {
  display: flex;
  gap: 0.3rem;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 8px;
  color: #8ba0b5;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f0f4f9;
  color: #1f5e4a;
}

.card-body {
  padding: 0.5rem 1rem 1rem 1rem;
}

.category-desc {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.4;
  margin-bottom: 0.8rem;
}

.category-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.meta-tag {
  font-size: 0.7rem;
  color: #6b85a0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.meta-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  display: inline-block;
}

.meta-dot.active {
  background: #2c9a6e;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid #edf2f7;
}

.empty-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.6;
}

/* 模态框 */
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
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #eef2f6;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #94a3b8;
  line-height: 1;
}

.close-btn:hover {
  color: #475569;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #2c4b3e;
  margin-bottom: 0.3rem;
}

.required {
  color: #e25c3e;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #2c9a6e;
  box-shadow: 0 0 0 3px rgba(44, 154, 110, 0.08);
}

.form-hint {
  font-size: 0.7rem;
  color: #8ba0b5;
  margin-top: 0.2rem;
  display: block;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}

.color-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 42px;
  height: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
}

.color-text {
  flex: 1;
  padding: 0.65rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.85rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #eef2f6;
}

.delete-modal {
  max-width: 400px;
}

.warning-text {
  color: #e25c3e;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

/* 响应式 */
@media (max-width: 680px) {
  .category-container {
    padding: 1rem;
  }
  .category-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>