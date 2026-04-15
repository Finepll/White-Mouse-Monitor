<template>
  <div class="grid">
    <!-- 上 -->
    <div class="row top">
      <div class="cell left">
        <slot name="top-left" />
      </div>
      <div class="cell right">
        <slot name="top-right" />
      </div>
    </div>

    <!-- 下 -->
    <div class="row bottom">
      <div class="cell left">
        <slot name="bottom-left" />
      </div>
      <div class="cell right">
        <slot name="bottom-right" />
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.row {
  display: flex;
  flex: 1;
}

.cell {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
}

/* 可选：调试用边框 */
.cell {
  border: 1px solid #eee;
}
</style>