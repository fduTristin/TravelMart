<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/stores'
import { ServiceType } from '@/types/store'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const storeStore = useStoreStore()

// 表单数据
interface StoreForm {
  storeName: string
  categories: string[]
  ownerIdNumber: string
  description: string
  registrationAddress: string
  registeredCapital: number
  registrationDate: string
}

const formData = ref<StoreForm>({
  storeName: '',
  categories: [],
  ownerIdNumber: '',
  description: '',
  registrationAddress: '',
  registeredCapital: 1000,
  registrationDate: new Date().toISOString().split('T')[0]
})

// 身份证号校验函数
const validateIdNumber = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入身份证号'))
    return
  }

  // 基本格式校验
  if (!/^\d{17}[\dXx]$/.test(value)) {
    callback(new Error('身份证号格式不正确'))
    return
  }

  // 出生日期校验
  const year = parseInt(value.substr(6, 4))
  const month = parseInt(value.substr(10, 2))
  const day = parseInt(value.substr(12, 2))
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    callback(new Error('身份证号中的出生日期无效'))
    return
  }

  // 校验位计算
  const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const parity = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  let ai = 0
  let wi = 0
  for (let i = 0; i < 17; i++) {
    ai = parseInt(value[i])
    wi = factor[i]
    sum += ai * wi
  }
  const last = parity[sum % 11]
  if (last.toLowerCase() !== value[17].toLowerCase()) {
    callback(new Error('身份证号校验位不正确'))
    return
  }

  callback()
}

// 表单规则
const rules = ref<FormRules>({
  storeName: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { max: 20, message: '店铺名称不能超过20个字符', trigger: 'blur' }
  ],
  categories: [
    { required: true, message: '请选择至少一个服务类型', trigger: 'change' }
  ],
  ownerIdNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { validator: validateIdNumber, trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商店简介', trigger: 'blur' },
    { max: 500, message: '商店简介不能超过500个字符', trigger: 'blur' }
  ],
  registrationAddress: [
    { required: true, message: '请输入备案地址', trigger: 'blur' },
    { max: 100, message: '备案地址不能超过100个字符', trigger: 'blur' }
  ],
  registeredCapital: [
    { required: true, message: '请输入注册资金', trigger: 'blur' },
    {
      type: 'number',
      min: 1000,
      message: '注册资金必须大于1000元',
      trigger: 'blur'
    }
  ],
  registrationDate: [
    { required: true, message: '请选择注册时间', trigger: 'change' }
  ]
})

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 重置表单数据
const resetForm = () => {
  formData.value = {
    storeName: '',
    categories: [],
    ownerIdNumber: '',
    description: '',
    registrationAddress: '',
    registeredCapital: 1000,
    registrationDate: new Date().toISOString().split('T')[0]
  }
  formRef.value?.resetFields()
}

// 监听路由变化，重置表单
watch(() => router.currentRoute.value, () => {
  resetForm()
})

// 返回列表
const handleBack = () => {
  router.push('/stores')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = true
        // 将categories数组转换为逗号分隔的字符串
        // 调用创建店铺的API
        const newStore = await storeStore.createStore(formData.value)
        ElMessage.success('店铺创建成功')
        router.push(`/stores/${newStore.id}`)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        ElMessage.error(`创建店铺失败: ${errorMessage}`)
      } finally {
        loading.value = false
      }
    } else {
      console.error('表单验证失败:', fields)
    }
  })
}
</script>

<template>
  <PageContainer title="开设新店铺">
    <div class="centered-form-container">
      <div class="form-container">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" class="form">
          <el-form-item label="店铺名称" prop="storeName">
            <el-input v-model="formData.storeName" placeholder="请输入店铺名称" />
          </el-form-item>

          <el-form-item label="服务类型" prop="categories">
            <el-checkbox-group v-model="formData.categories">
              <el-checkbox v-for="type in Object.values(ServiceType)" :key="type" :label="type">
                {{ type }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="身份证号" prop="ownerIdNumber">
            <el-input v-model="formData.ownerIdNumber" placeholder="请输入身份证号" />
          </el-form-item>

          <el-form-item label="商店简介" prop="description">
            <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入商店简介" />
          </el-form-item>

          <el-form-item label="备案地址" prop="registrationAddress">
            <el-input v-model="formData.registrationAddress" placeholder="请输入备案地址" />
          </el-form-item>

          <el-form-item label="注册资金" prop="registeredCapital">
            <el-input-number v-model="formData.registeredCapital" :min="1000" :step="1000" :precision="2" />
          </el-form-item>

          <el-form-item label="注册时间" prop="registrationDate">
            <el-date-picker v-model="formData.registrationDate" type="date" placeholder="选择注册时间" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" />
          </el-form-item>

          <el-form-item>
            <BaseButton type="primary" @click="handleSubmit" :loading="loading">
              创建店铺
            </BaseButton>
            <BaseButton @click="handleBack" :disabled="loading">
              取消
            </BaseButton>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
/* 居中表单容器 */
.centered-form-container {
  padding: 20px;
  z-index: 1;
  animation: fadeIn 0.3s ease-out;
  /* 淡入动画 */
}

/* 表单容器样式 */
.form-container {
  background: rgb(252, 252, 252);
  border-radius: 1vw;
  width: 60vw;
  height: 70vh;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 2vh 2vw 2vh 2vw;
}

.form {
  margin-top: 20px;
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
:deep(.el-form-item) {
  margin-bottom: 2.5vh;
  display: flex;
  align-items: center;
}
:deep(.el-form-item__label) {
  font-size: 2vh;
  font-weight: 600;
  color: #15324d;
  margin-right: 1vw;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  height: 4vh;
  box-shadow: none;
  border: 1px solid var(--el-border-color);
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  border-color: var(--el-color-primary);
}

:deep(.el-radio__label),
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-family: "Noto Sans SC", sans-serif;
  font-size: 1.9vh;
}

:deep(.el-form-item:first-child) {
  margin-top: 4vh;
}

:deep(.el-form-item:last-child) {
  margin-top: 4vh;
  margin-bottom: 4vh;
  margin-left: 11vw;
}

:deep(.el-form-item:last-child .el-form-item__content) {
  gap: 2vw;
  /* 按钮间距 */
}

:deep(.el-input) {
  display: flex;
  max-width: 20vw;
}

:deep(.el-radio.is-checked .el-radio__label) {
  color: #275f94;
  font-weight: bold;
}

:deep(.el-radio.is-checked .el-radio__input .el-radio__inner) {
  border-color: #275f94;
  background-color: #275f94;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 1vw;
}

:deep(.el-checkbox__inner) {
  width: 2vh;
  height: 2vh;
  border-radius: 0.2vw;
  border-color: #275f94;
}

:deep(.el-checkbox__label) {
  font-size: 2vh;
  color: #15324d;
}

:deep(.el-input-number) {
  width: 12vw;
}
</style>
