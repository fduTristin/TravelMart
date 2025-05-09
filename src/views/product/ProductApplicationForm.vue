<template>
  <PageContainer title="申请上架新商品">
    <div class="centered-form-container">
      <div class="form-container">
        <el-form ref="formRef" :model="productFormData" :rules="rules" class="form">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="productFormData.name" placeholder="请输入商品名称" />
          </el-form-item>

          <el-form-item label="商品描述" prop="description">
            <el-input v-model="productFormData.description" type="textarea" :rows="4" placeholder="请输入商品描述 (500字以内)" />
          </el-form-item>

          <el-form-item label="商品价格 (元)" prop="price">
            <el-input-number v-model="productFormData.price" :precision="2" :step="10" :min="0" placeholder="请输入价格" />
          </el-form-item>

          <el-form-item label="商品图片URL" prop="imageUrl">
            <el-input v-model="productFormData.imageUrl" placeholder="请输入商品图片的URL" />
          </el-form-item>

          <el-form-item>
            <BaseButton type="primary" @click="handleSubmit" :loading="isLoading">
              提交申请
            </BaseButton>
            <BaseButton @click="handleReset" :disabled="isLoading">
              重置表单
            </BaseButton>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElForm, ElInput, ElButton, ElInputNumber, ElCard, ElAlert } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useProductStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth'; // 仍可用于用户角色等检查
import type { CreateProductDTO } from '@/types/product';
import { useRouter, useRoute } from 'vue-router'; // 导入 useRoute 和 useRouter
import BaseButton from '@/components/BaseButton.vue';
import PageContainer from '@/components/PageContainer.vue';

// Pinia Stores
const productStore = useProductStore();
const authStore = useAuthStore(); // 保留，可能用于权限校验等

// Vue Router
const router = useRouter();
const route = useRoute();

// Form Ref
const formRef = ref<FormInstance>();

// Form Data
const productFormData = ref<{
  name: string;
  description: string;
  price: number | undefined;
  imageUrl: string;
}>({
  name: '',
  description: '',
  price: undefined,
  imageUrl: '',
});

const merchantStoreId = ref<number | null>(null); // 从路由参数获取的店铺ID

// Validation Rules (与之前版本相同)
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { max: 500, message: '商品描述不能超过500个字符', trigger: 'input' },
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }, // 初始校验
    { type: 'number', message: '价格必须是数字', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === undefined || value === null) {
          // el-input-number可能在清空时为undefined/null, 但因:min="0.01", 不会小于等于0
          // :required 已经处理了空值，这里主要校验 > 0
          callback(); // 如果允许为空，则需要修改此逻辑
        } else if (value <= 0) { // 价格 > 0 的校验由 :min="0.01" 处理了大部分
          // 但用户可能通过非标准方式输入，所以保留校验是好的
          callback(new Error('价格必须大于0'));
        }
        else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  imageUrl: [
    { required: true, message: '请输入商品图片URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: ['blur', 'change'] },
  ],
});

// Loading state
const isLoading = computed(() => productStore.loading);

// Clear error from store
const clearError = () => {
  productStore.error = null;
};

// Get merchant's store ID from route parameter
onMounted(() => {
  const storeIdFromRoute = route.params.storeId; // storeId 是你在路由中定义的参数名
  if (storeIdFromRoute) {
    const parsedStoreId = Array.isArray(storeIdFromRoute) ? Number(storeIdFromRoute[0]) : Number(storeIdFromRoute);
    if (!isNaN(parsedStoreId) && parsedStoreId > 0) {
      merchantStoreId.value = parsedStoreId;
      console.log(`当前操作的店铺ID: ${merchantStoreId.value}`);
      // 可选: 验证当前登录的商户是否有权管理此 storeId
      // 这需要额外的逻辑，例如调用一个服务检查 store.ownerId === authStore.userId
      // const currentStore = storeStore.stores.find(s => s.id === merchantStoreId.value);
      // if (!currentStore || currentStore.ownerId !== authStore.userId) {
      //   ElMessage.error('您无权操作此店铺。');
      //   router.push({ name: 'UserStoresList' }); // 跳转到商户的店铺列表或其他安全页面
      // }
    } else {
      ElMessage.error('路由中的店铺ID无效。');
      // router.push({ name: 'Home' }); // 或其他适当的错误处理/跳转
    }
  } else {
    ElMessage.error('无法确定目标店铺，路径中缺少店铺ID。');
    // router.push({ name: 'Home' }); // 或其他适当的错误处理/跳转
  }
});

// Handle Form Submission
const handleSubmit = async () => {
  if (!formRef.value) return;
  if (!merchantStoreId.value) {
    ElMessage.error('店铺ID未知，无法提交商品申请。请确保路径正确。');
    return;
  }

  await formRef.value.validate(async (valid) => {
    if (valid) {
      const submissionData: CreateProductDTO = {
        name: productFormData.value.name,
        description: productFormData.value.description,
        price: productFormData.value.price!,
        imageUrl: productFormData.value.imageUrl,
        storeId: merchantStoreId.value!,
      };

      try {
        await productStore.applyForNewProduct(submissionData);
        ElMessage.success('商品上架申请已成功提交！');
        formRef.value?.resetFields();
        // 上架申请提交成功后，导航到申请列表页面
        router.push({ name: 'ProductApplicationList' });
      } catch (submitError: any) {
        ElMessage.error(submitError?.message || productStore.error || '提交申请失败，请稍后再试。');
      }
    } else {
      ElMessage.info('请检查表单中的必填项和格式是否正确。');
      return false;
    }
  });
};

// Handle Form Reset
const handleReset = () => {
  formRef.value?.resetFields();
  clearError();
};

</script>

<style scoped>
.centered-form-container {
  z-index: 1;
  animation: fadeIn 0.3s ease-out;
}

.form-container {
  background: rgb(252, 252, 252);
  border-radius: 1vw;
  width: 60vw;
  height: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 2vh 2vw;
}

.form {
  margin-top: 20px;
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

:deep(.el-form-item) {
  margin-bottom: 2.5vh;
  display: flex;
  align-items: center;
}

:deep(.el-form-item__label) {
  width: 15vh;
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

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-family: "Noto Sans SC", sans-serif;
  font-size: 1.9vh;
}

:deep(.el-form-item:last-child) {
  margin-top: 4vh;
  margin-bottom: 4vh;
  margin-left: 18vw;
}

:deep(.el-form-item:last-child .el-form-item__content) {
  gap: 2vw;
}

:deep(.el-input-number) {
  width: 12vw;
}
</style>