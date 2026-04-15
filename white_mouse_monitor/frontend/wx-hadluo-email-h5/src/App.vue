<template>
  <div class="app-wrapper">
    <router-view />
  </div>
</template>

<script setup>
// 不需要引入图标了，因为已经移除了菜单
</script>

<style scoped>
.app-wrapper {
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>