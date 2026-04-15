<template>
  <div class="background">
    <svg class="wave-svg" viewBox="0 0 1440 800" preserveAspectRatio="none">
      <defs>
        <!-- 第一层波浪渐变 - 更鲜艳 -->
        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(88,63,228,1)">
            <animate attributeName="stop-color" values="rgba(88,63,228,1);rgba(0,188,212,1);rgba(156,39,176,1);rgba(63,81,181,1);rgba(88,63,228,1)" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" style="stop-color:rgba(0,188,212,1)">
            <animate attributeName="stop-color" values="rgba(0,188,212,1);rgba(156,39,176,1);rgba(63,81,181,1);rgba(88,63,228,1);rgba(0,188,212,1)" dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" style="stop-color:rgba(156,39,176,1)">
            <animate attributeName="stop-color" values="rgba(156,39,176,1);rgba(63,81,181,1);rgba(88,63,228,1);rgba(0,188,212,1);rgba(156,39,176,1)" dur="6s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        
        <!-- 第二层波浪渐变 - 更淡、不同色调 -->
        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(200,180,255,0.7)">
            <animate attributeName="stop-color" values="rgba(200,180,255,0.7);rgba(180,230,240,0.7);rgba(220,170,240,0.7);rgba(190,200,255,0.7);rgba(200,180,255,0.7)" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" style="stop-color:rgba(180,230,240,0.7)">
            <animate attributeName="stop-color" values="rgba(180,230,240,0.7);rgba(220,170,240,0.7);rgba(190,200,255,0.7);rgba(200,180,255,0.7);rgba(180,230,240,0.7)" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" style="stop-color:rgba(220,170,240,0.7)">
            <animate attributeName="stop-color" values="rgba(220,170,240,0.7);rgba(190,200,255,0.7);rgba(200,180,255,0.7);rgba(180,230,240,0.7);rgba(220,170,240,0.7)" dur="8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      
      <!-- 纯白色背景 -->
      <rect x="0" y="0" width="1440" height="800" fill="rgba(255,255,255,1)" />
      
      <!-- 第一层波浪 - 鲜艳，不透明 -->
      <path fill="url(#waveGradient1)" fill-opacity="1">
        <animate attributeName="d" 
          values="
            M0,800 L100,700 C200,600 300,650 400,550 C500,450 600,500 700,400 C800,300 900,350 1000,250 C1100,150 1200,200 1300,100 L1440,0 L1440,800 Z;
            M0,800 L100,650 C200,500 300,600 400,450 C500,300 600,400 700,250 C800,100 900,200 1000,50 C1100,-50 1200,50 1300,-100 L1440,-150 L1440,800 Z;
            M0,800 L100,700 C200,600 300,650 400,550 C500,450 600,500 700,400 C800,300 900,350 1000,250 C1100,150 1200,200 1300,100 L1440,0 L1440,800 Z"
          dur="5s" repeatCount="indefinite" />
      </path>
      
      <!-- 第二层波浪 - 更淡，位置更低，速度不同 -->
      <path fill="url(#waveGradient2)" fill-opacity="0.6">
        <animate attributeName="d"
          values="
            M0,800 L200,780 C400,760 500,820 700,750 C900,680 1000,740 1200,670 L1440,600 L1440,800 Z;
            M0,800 L200,760 C400,720 500,800 700,730 C900,660 1000,720 1200,650 L1440,580 L1440,800 Z;
            M0,800 L200,780 C400,760 500,820 700,750 C900,680 1000,740 1200,670 L1440,600 L1440,800 Z"
          dur="8s" repeatCount="indefinite" />
      </path>
      
      <!-- 第三层波浪 - 非常淡，增加层次感 -->
      <path fill="url(#waveGradient2)" fill-opacity="0.3">
        <animate attributeName="d"
          values="
            M0,800 L250,810 C500,820 600,780 800,790 C1000,800 1100,760 1440,770 L1440,800 Z;
            M0,800 L250,790 C500,780 600,820 800,810 C1000,800 1100,780 1440,790 L1440,800 Z;
            M0,800 L250,810 C500,820 600,780 800,790 C1000,800 1100,760 1440,770 L1440,800 Z"
          dur="10s" repeatCount="indefinite" />
      </path>
    </svg>
  </div>
</template>

<script>
export default {
  name: "BackGround"
}
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -99999;
  overflow: hidden;
  background-color: rgba(255,255,255,1);
}

.wave-svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
