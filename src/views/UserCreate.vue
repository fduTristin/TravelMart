<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()

// 表单数据
const formData = ref({
  user_id: '',
  username: '',
  email: ''
})

// 错误消息
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
    loading.value = true
    // 调用 API
    await axios.post(`/lab1/users/${formData.value.user_id}`, {
      username: formData.value.username,
      email: formData.value.email
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
</script>

<template>
  <PageContainer title="Create New User">
    <template #actions>
      <el-button @click="handleCancel">
        <el-icon><ArrowLeft /></el-icon>
        Back
      </el-button>
    </template>

    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        label-width="120px"
        class="form"
        :disabled="loading"
      >
        <el-form-item label="Username" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="Enter username"
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="Enter email"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
            size="large"
          >
            Submit
          </el-button>
          <el-button
            @click="handleCancel"
            :disabled="loading"
            size="large"
          >
            Cancel
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped>
.form-container {
  max-width: 800px;
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

:deep(.el-button) {
  margin-left: 12px;
}

:deep(.el-button:first-child) {
  margin-left: 0;
}

:deep(.el-input__count) {
  background: transparent;
}
</style>
