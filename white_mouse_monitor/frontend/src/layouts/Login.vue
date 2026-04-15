<template>
  <BackGround />
  <Teleport to="body">
    <div class="login-layout">
      <div class="login-left">
        <appIcon>
          <template #icon>
            <MouseIcon/>
          </template>
          <template #text>
            <p>小白鼠监测管理系统</p>
          </template>
        </appIcon>
      </div>
      <div class="login-right">
        <router-view />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import MouseIcon from '@/components/icons/IconMouse.vue'
import appIcon from '@/components/appTitle.vue'
import BackGround from '@/components/Background.vue'
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  /* background: #f5f7fa; */
}

.login-left {
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #8781be;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}

.login-left p {
  font-size: 36px;
  font-weight: 600;
  background: linear-gradient(to right, #015e68, #6302ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  white-space: nowrap;
}

.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  
}
</style>