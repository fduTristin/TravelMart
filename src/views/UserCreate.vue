<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import BaseButton from '@/components/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  userName: '',
  userEmail: '',
  userRole: 'CUSTOMER' as 'ADMIN' | 'MERCHANT' | 'CUSTOMER',
  userTel: '',
  userPwd: ''
})

// 重置表单数据
const resetForm = () => {
  formData.value = {
    userName: '',
    userEmail: '',
    userRole: 'CUSTOMER',
    userTel: '',
    userPwd: ''
  }
  formRef.value?.resetFields()
}

// 组件加载时重置表单
onMounted(() => {
  resetForm()
})

watch(
  () => authStore.token,
  (newToken) => {
    if (newToken) {
      resetForm()
    }
  }
)

// 监听路由变化，重置表单
watch(() => router.currentRoute.value, () => {
  resetForm()
})

const messages = {
  success: '注册成功',
  error: '注册失败'
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

    // 调用authStore的register方法
    await authStore.register({
      userName: formData.value.userName,
      userPwd: formData.value.userPwd,
      userRole: formData.value.userRole,
      userEmail: formData.value.userEmail,
      userTel: formData.value.userTel
    })

    ElMessage.success(messages.success)
    // 注册成功后跳转到登录页面
    router.push('/login')
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

// 取消
const handleCancel = () => {
  router.back()
}

// 密码规则验证
const validatePassword = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    return callback(new Error('请输入密码'))
  }
  if (value.length < 6 || value.length > 32) {
    return callback(new Error('密码长度应为6到32个字符'))
  }
  if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
    return callback(new Error('密码只能包含字母、数字、-、_'))
  }

  let types = 0
  if (/[a-zA-Z]/.test(value)) types++
  if (/\d/.test(value)) types++
  if (/[-_]/.test(value)) types++

  if (types < 2) {
    return callback(new Error('密码至少包含字母、数字、特殊字符（-_）中的两种'))
  }

  callback()
}

// 表单验证规则
const rules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{3,10}$/,
      message: '用户名仅可包含字母、数字、下划线，长度为3-10个字符',
      trigger: 'blur'
    }
  ],
  userEmail: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur'
    }
  ],
  userTel: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '请输入有效的11位手机号',
      trigger: 'blur'
    }
  ],
  userPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
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
        <h2 class="login-title">用户注册</h2>
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="9vw" class="form" :disabled="loading">
          <el-form-item label="角色" prop="userRole">
            <el-radio-group v-model="formData.userRole">
              <el-radio label="CUSTOMER">普通用户</el-radio>
              <el-radio label="MERCHANT">商户</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="用户名" prop="userName">
            <el-input v-model="formData.userName" />
          </el-form-item>

          <el-form-item label="密码" prop="userPwd">
            <el-input v-model="formData.userPwd" type="password" show-password />
          </el-form-item>

          <el-form-item label="手机号" prop="userTel">
            <el-input v-model="formData.userTel" />
          </el-form-item>

          <el-form-item label="邮箱" prop="userEmail">
            <el-input v-model="formData.userEmail" />
          </el-form-item>

          <el-form-item>
            <BaseButton type="primary" @click="handleSubmit" :loading="loading">
              注册
            </BaseButton>
            <BaseButton @click="handleCancel" :disabled="loading">
              取消
            </BaseButton>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全屏背景样式 */
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

/* 背景图片样式 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/background.jpg');
  /* 替换为你的图片路径 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(5px) brightness(0.7);
  /* 模糊和变暗效果 */
}

/* 居中表单容器 */
.centered-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  animation: fadeIn 0.3s ease-out;
}

/* 表单容器样式 */
.form-container {
  background: rgb(247, 249, 249);
  border-radius: 1vh;
  width: 32vw;
  height: 50vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-title {
  text-align: center;
  margin-bottom: 0vh;
  margin-top: 1vh;
  color: #275f94;
  font-size: 3vh;
  font-weight: 600;
}

/* 淡入动画 */
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

/* 调整表单元素样式 */
.el-form-item {
  margin-bottom: 2vh;
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
  height: 3.5vh;
}

:deep(.el-form-item:first-child) {
  margin-top: 3vh;
}

:deep(.el-form-item:last-child) {
  margin-top: 3vh;
  margin-bottom: 2vh;
}

:deep(.el-form-item:last-child .el-form-item__content) {
  gap: 1vw;
  /* 按钮间距 */
}

:deep(.el-input) {
  display: flex;
  max-width: 17vw;
}

:deep(.el-radio.is-checked .el-radio__label) {
  color: #275f94;
  font-weight: bold;
}

:deep(.el-radio.is-checked .el-radio__input .el-radio__inner) {
  border-color: #275f94;
  background-color: #275f94;
}
</style>
