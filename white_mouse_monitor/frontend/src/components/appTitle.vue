<template>
  <div>
    <div class="logo-title">
      <div class="logo-icon">
        <slot name="icon"></slot>
      </div>
      <h2 class="logo-text">
        <slot name="text"></slot>
      </h2>
    </div>
  </div>
  </template>

  <style scoped>
  .logo-title{
    display: flex;
    align-items:flex-start;
  }
  .logo-icon{
    width: 60px;
    height: 60px;
  }
  .logo-text{
    font-size: 20px;
    font-weight: bold;
    background: linear-gradient(to right, rgb(24, 241, 187), rgb(239, 15, 15));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-left: 10px;
  }
 </style>