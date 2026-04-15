<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <div class="register-form">
      <div class="form-item">
        <label>邮箱：</label>
        <input type="email" v-model="email" placeholder="请输入邮箱">
      </div>
      <div class="form-item verification-code">
        <label>验证码：</label>
        <input type="text" v-model="verificationCode" placeholder="请输入验证码">
        <button @click="sendVerificationCode" :disabled="cooldown > 0">
          {{ cooldown > 0 ? `${cooldown}秒后重试` : '获取验证码' }}
        </button>
      </div>
      <div class="form-item">
        <label>密码：</label>
        <input type="password" v-model="password" placeholder="请输入密码">
      </div>
      <button class="register-btn" @click="handleRegister">注册</button>
    </div>
  </div>
</template>

<script>
import { getCode, register } from '@/api/registerApi'
import { ElMessage } from 'element-plus'

export default {
  name: 'Register',
  data() {
    return {
      email: '3571289092@qq.com',
      verificationCode: '',
      password: '',
      cooldown: 0
    }
  },
  methods: {
    async sendVerificationCode() {
      if (!this.email) {
        ElMessage.warning('请输入邮箱地址');
        return;
      }
      try {
        await getCode(this.email);
        this.startCooldown();
        ElMessage.success('验证码已发送，请查收邮件');
      } catch (error) {
        ElMessage.error('发送验证码失败');
      }
    },
    startCooldown() {
      this.cooldown = 60;
      const timer = setInterval(() => {
        this.cooldown--;
        if (this.cooldown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },
    async handleRegister() {
      if (!this.email || !this.verificationCode || !this.password) {
        ElMessage.warning('请填写完整信息');
        return;
      }
      try {
        await register({
          email: this.email,
          code: this.verificationCode,
          password: this.password
        });
        ElMessage.success('注册成功');
        this.$router.push('/login');
      } catch (error) {
       console.log(error);
     
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
}

.register-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.verification-code {
  display: flex;
  gap: 10px;
}

.verification-code input {
  flex: 1;
}

.verification-code button {
  padding: 8px 15px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.verification-code button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.register-btn:hover {
  background: #66b1ff;
}
</style>