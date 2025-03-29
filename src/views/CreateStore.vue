<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStoreStore, ServiceType } from '@/stores/store'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer.vue'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const storeStore = useStoreStore()

// 表单数据
interface StoreForm {
  storeName: string
  serviceTypes: ServiceType[]
  idNumber: string
  description: string
  address: string
  capital: number
  registrationDate: string
}

const formData = ref<StoreForm>({
  storeName: '',
  serviceTypes: [],
  idNumber: '',
  description: '',
  address: '',
  capital: 1000,
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
  serviceTypes: [
    { required: true, message: '请选择至少一个服务类型', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value.length > 4) {
          callback(new Error('最多只能选择4个服务类型'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  idNumber: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { validator: validateIdNumber, trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商店简介', trigger: 'blur' },
    { max: 500, message: '商店简介不能超过500个字符', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入备案地址', trigger: 'blur' },
    { max: 100, message: '备案地址不能超过100个字符', trigger: 'blur' }
  ],
  capital: [
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
        // 调用创建店铺的API
        const newStore = storeStore.createStore(formData.value)
        ElMessage.success('店铺创建成功')
        router.push(`/store/${newStore.storeId}`)
      } catch (error) {
        ElMessage.error('创建店铺失败')
      }
    } else {
      console.error('表单验证失败:', fields)
    }
  })
}
</script>

<template>
  <PageContainer title="开设新店铺">
    <template #actions>
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </template>

    <div class="create-store-form">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="form"
      >
        <el-form-item label="店铺名称" prop="storeName">
          <el-input v-model="formData.storeName" placeholder="请输入店铺名称" />
        </el-form-item>

        <el-form-item label="服务类型" prop="serviceTypes">
          <el-checkbox-group v-model="formData.serviceTypes">
            <el-checkbox
              v-for="type in Object.values(ServiceType)"
              :key="type"
              :label="type"
            >
              {{ type }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="formData.idNumber" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="商店简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商店简介"
          />
        </el-form-item>

        <el-form-item label="备案地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入备案地址" />
        </el-form-item>

        <el-form-item label="注册资金" prop="capital">
          <el-input-number
            v-model="formData.capital"
            :min="1000"
            :step="1000"
            :precision="2"
          />
        </el-form-item>

        <el-form-item label="注册时间" prop="registrationDate">
          <el-date-picker
            v-model="formData.registrationDate"
            type="date"
            placeholder="选择注册时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">创建店铺</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </PageContainer>
</template>

<style scoped>
.create-store-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form {
  margin-top: 20px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.el-input-number) {
  width: 240px;
}
</style>
