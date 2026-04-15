<script setup>
import M_Navigator from './M_Navigator.vue'
import HomeIcon from './icons/IconHome.vue'

</script>

<template>
  <div class="upper">
    <M_Navigator>
      <template #navigator>
        <HomeIcon />
      </template>
      <template #item>
        <div class="nav-links">
          <a href="#" target="_blank" rel="noopener">首页</a>
        </div>
      </template>
    </M_Navigator>
    <M_Navigator>
      <template #navigator>
        <HomeIcon />
      </template>
      <template #item>
        <div class="nav-links">
          <a href="#" target="_blank" rel="noopener">产品功能</a>
        </div>
      </template>
    </M_Navigator>
    <M_Navigator>
      <template #navigator>
        <HomeIcon />
      </template>
      <template #item>
        <div class="nav-links">
          <a href="#" target="_blank" rel="noopener">关于我们</a>
        </div>
      </template>
    </M_Navigator>
    <M_Navigator>
      <template #navigator>
        <HomeIcon />
      </template>
      <template #item>
        <div class="nav-links">
          <a href="#" target="_blank" rel="noopener">帮助中心</a>
        </div>
      </template>
    </M_Navigator>
  </div>
</template>

<style scoped>
.upper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.8;
}
</style>