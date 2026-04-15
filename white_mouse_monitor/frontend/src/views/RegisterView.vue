<template>
  <div class="register-container">
      <div class="form-header">
          <h2>创建账号</h2>
          <p>开启您的美好旅程</p>
      </div>
      <form @submit.prevent="handleRegister" class="floating-form">
          <div class="input-group">
              <input type="text" id="username" v-model="username" required maxlength="20" />
              <label for="username">用户名</label>
              <span class="highlight"></span>
          </div>
          <div class="input-group">
              <input type="email" id="email" v-model="email" required />
              <label for="email">邮箱地址</label>
              <span class="highlight"></span>
          </div>
          <div class="input-group verification-group">
              <input type="text" id="verificationCode" v-model="verificationCode" required maxlength="6" />
              <label for="verificationCode">验证码</label>
              <button 
                type="button" 
                @click="sendVerificationCode" 
                class="send-code-btn"
                :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
              </button>
              <span class="highlight"></span>
          </div>
          <div class="input-group">
              <input type="password" id="password" v-model="password" required minlength="6" maxlength="20" />
              <label for="password">密码</label>
              <span class="highlight"></span>
          </div>
          <div class="input-group">
              <input type="password" id="confirmPassword" v-model="confirmPassword" required minlength="6" maxlength="20" />
              <label for="confirmPassword">确认密码</label>
              <span class="highlight"></span>
          </div>
          <button type="submit" class="submit-btn">
              <span>立即注册</span>
              <i class="arrow-icon"></i>
          </button>
          <div class="form-footer">
              <span>已有账号？</span>
              <a href="/login">立即登录</a>
          </div>
      </form>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const email = ref('')
const verificationCode = ref('')
const password = ref('')
const confirmPassword = ref('')

const countdown = ref(0)
const timer = ref(null)

const sendVerificationCode = async () => {
  if (!email.value) {
    alert('请输入邮箱')
    return
  }

  try {
    const res = await axios.post('http://localhost:8080/sendCode', null, {
      params: { email: email.value }
    })
    alert(res.data)

    countdown.value = 60
    timer.value = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer.value)
    }, 1000)

  } catch (err) {
    alert('发送失败')
  }
}

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('两次密码不一致')
    return
  }

  try {
    const res = await axios.post('http://localhost:8080/register', null, {
      params: {
        username: username.value,
        email: email.value,
        code: verificationCode.value,
        password: password.value
      }
    })

    alert(res.data)

    if (res.data === '注册成功') {
      router.push('/login')
    }

  } catch (err) {
    alert('注册失败')
  }
}

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.register-container {
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.form-header {
    text-align: center;
    margin-bottom: 30px;
}

.form-header h2 {
    color: #2c3e50;
    font-size: 32px;
    margin-bottom: 5px;
    font-weight: 700;
}

.form-header p {
    color: #4e5656;
    font-size: 16px;
}

.floating-form .input-group {
    position: relative;
    margin-bottom: 20px;
}

.input-group input {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: transparent;
}

.input-group label {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    padding: 0 5px;
    color: rgba(0, 0, 0, 0.5);
    font-size: 16px;
    transition: all 0.3s ease;
    pointer-events: none;
}

.input-group input:focus,
.input-group input:valid {
    border-color: #3498db;
}

.input-group input:focus + label,
.input-group input:valid + label {
    top: 0;
    font-size: 14px;
    color: #3498db;
}

.verification-group {
    display: flex;
    gap: 10px;
}

.verification-group input {
    flex: 1;
}

.send-code-btn {
    padding: 0 20px;
    background: #e8f5fe;
    color: #3498db;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.send-code-btn:hover {
    background: #d0e9fd;
}

.send-code-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

.submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.arrow-icon {
    border: solid white;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
}

.form-footer {
    text-align: center;
    margin-top: 20px;
    color: #4e5656;
}

.form-footer a {
    color: #3498db;
    text-decoration: none;
    margin-left: 5px;
    font-weight: 600;
}

.form-footer a:hover {
    text-decoration: underline;
}
</style>