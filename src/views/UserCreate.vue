<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import BaseButton from '@/components/BaseButton.vue'
import axios from 'axios'

const router = useRouter()


const formData = ref({
  userId: 1, // 生成自增 ID
  userName: '',
  userEmail: '',
  userRole: '普通用户',
  userPhoneNumber: '',
  userPassword: ''
})

const messages = {
  success: 'Operation successful',
  error: 'Failed to create user'
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
    // 调用 API
    const request = axios.create({
      baseURL: 'http://localhost:8080',
      timeout: 5000
    })
    await request.post(`/lab1/users/${formData.value.userId}`, {
      userName: formData.value.userName,
      userEmail: formData.value.userEmail
    })
    ElMessage.success(messages.success)
    // 使用 replace 而不是 push，这样返回时不会回到创建页面
    router.replace('/users')
  } catch (e) {
    ElMessage.error(messages.error)
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

// 密码规则验证
const validatePassword = (_: any, value: string, callback: any) => {
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
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur'
    }
  ],
  userPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '请输入有效的11位手机号',
      trigger: 'blur'
    }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ]
}

</script>

<template>
  <PageContainer title="">
    <template #actions>
      <BaseButton 
        type="default" 
        @click="handleCancel"
        :disabled="loading"
      >
        返回
      </BaseButton>
    </template>

    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="form"
        :disabled="loading"
      >

        <el-form-item label="角色" prop="userRole">
          <el-radio-group v-model="formData.userRole">
            <el-radio label="普通用户" />
            <el-radio label="商户" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="formData.userName"
          />
        </el-form-item>

        <el-form-item label="密码" prop="userPassword">
          <el-input v-model="formData.userPassword" type="password" show-password />
        </el-form-item>


        <el-form-item label="手机号" prop="userPhoneNumber">
          <el-input v-model="formData.userPhoneNumber" />
        </el-form-item>

        <el-form-item label="邮箱" prop="userEmail">
          <el-input
            v-model="formData.userEmail"
          />
        </el-form-item>

        <el-form-item>
          <BaseButton 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
          >
            提交
          </BaseButton>
          <BaseButton 
            @click="handleCancel"
            :disabled="loading"
          >
            取消
          </BaseButton>
        </el-form-item>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped>
.button-text {
  font-size: 20px;
  font-weight: 700;
  margin-left: 4px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.form-container {
  max-width: 60vw;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  box-shadow: none;
  border: 1px solid var(--el-border-color);
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  border-color: var(--el-color-primary);
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
  text-align: right;
}
</style>