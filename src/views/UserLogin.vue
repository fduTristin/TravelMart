<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import BaseButton from '@/components/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formData = ref({
  userName: localStorage.getItem('lastUsername') || '',
  userPwd: ''
})

// 清空密码字段的函数
const clearPassword = () => {
  formData.value.userPwd = ''
}

// 监听路由变化，当进入登录页时清空密码字段
watch(() => route.path, (newPath) => {
  if (newPath === '/login') {
    clearPassword()
  }
})

// 组件挂载时清空密码字段
onMounted(() => {
  clearPassword()
})

const messages = {
  success: '登录成功',
  error: '登录失败'
}

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 调用authStore的login方法
    await authStore.login({
      userName: formData.value.userName,
      userPwd: formData.value.userPwd
    })

    ElMessage.success(messages.success)
    // 登录成功后跳转到原本要访问的页面或首页
    const redirectPath = route.query.redirect as string
    router.push(redirectPath || '/')
  } catch (error) {
    // 错误信息已经在store中处理，这里只需显示错误消息即可
    if (authStore.error) {
      ElMessage.error(authStore.error)
    } else {
      ElMessage.error(messages.error)
    }
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const handleRegister = () => {
  router.push('/register')
}

// 表单验证规则
const rules: FormRules = {
  userName: [
    { message: '请输入用户名', trigger: 'blur' }
  ],
  userPwd: [
    { message: '请输入密码', trigger: 'blur' }
  ]
}
</script>

<template>
  <!-- 全屏背景层 -->
  <div class="fullscreen-background">
    <!-- 背景图片层 -->
    <div class="background-image"></div>

    <!-- 居中表单容器 -->
    <div class="centered-form-container">
      <div class="form-container">
        <h2 class="login-title">用户登录</h2>
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="9vw" class="form" :disabled="loading || authStore.loading">
          <el-form-item label="用户名" prop="userName">
            <el-input v-model="formData.userName" />
          </el-form-item>

          <el-form-item label="密码" prop="userPwd">
            <el-input v-model="formData.userPwd" type="password" show-password />
          </el-form-item>

          <el-form-item>
            <BaseButton type="primary" @click="handleSubmit" :loading="loading || authStore.loading">
              登录
            </BaseButton>
            <BaseButton @click="handleRegister" :disabled="loading || authStore.loading">
              注册账号
            </BaseButton>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(6px) brightness(0.7);
}

.centered-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  animation: fadeIn 0.3s ease-out;
}

.form-container {
  background: rgb(247, 249, 249);
  border-radius: 1vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 32vw;
  height: 40vh;
  /* 确保内容居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  text-align: center;
  margin-bottom: 3vh;
  color: #275f94;
  font-size: 3vh;
  font-weight: 600;
}

.el-form-item {
  margin-bottom: 3vh;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-form-item__label) {
  font-size: 2vh;
  font-weight: 500;
  margin-right: 0.5vw;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  box-shadow: none;
  border: 1px solid var(--el-border-color);
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  border-color: #275f94;
}

:deep(.el-radio__label),
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-family: "Noto Sans SC", sans-serif;
  font-size: 2vh;
}

:deep(.el-input) {
  display: flex;
  max-width: 17vw;
}

:deep(.el-form-item:last-child) {
  margin-top: 4vh;
  margin-bottom: 0;
}
</style>
