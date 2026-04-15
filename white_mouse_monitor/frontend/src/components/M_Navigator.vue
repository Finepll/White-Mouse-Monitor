<template>
  <!-- 导航部分 -->
  <div class="nav">
    <div class="nav-item">
      <slot name="navigator"></slot>
    </div>
    <div class="nav-item">
      <slot name="item"></slot>
    </div>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
}
</style>