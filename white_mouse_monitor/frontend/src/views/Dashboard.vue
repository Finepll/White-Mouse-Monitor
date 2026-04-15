<template>
  <div class="page-layout">
    <FourGrid>
      <template #top-left>
        <LogoArea />
      </template>

      <template #top-right>
        <TopToolbar />
      </template>

      <template #bottom-left>
        <Sidebar />
      </template>

      <template #bottom-right>
        <MainContent />
      </template>
    </FourGrid>
  </div>
</template>
<script setup>
import FourGrid from '@/components/FourGrid.vue'
</script>

<style scoped>
/* 整个页面铺满视口 */
.page-layout {
  height: 100vh;
}

/* 控制 FourGrid 内部结构（✅ 关键） */
.page-layout :deep(.grid) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部一行：固定高度 */
.page-layout :deep(.top) {
  flex: 0 0 64px;
}

/* 底部一行：撑满 */
.page-layout :deep(.bottom) {
  flex: 1;
}

/* 左侧固定宽度 */
.page-layout :deep(.top-left),
.page-layout :deep(.bottom-left) {
  flex: 0 0 240px;
}

/* 右侧自适应 */
.page-layout :deep(.top-right),
.page-layout :deep(.bottom-right) {
  flex: 1;
}
</style>