<template>
  <PageContainer :title="pageTitle">

      <el-skeleton :rows="5" animated v-if="isLoading" />

      <el-form
        v-else-if="productToEdit"
        ref="formRef"
        :model="productFormData"
        :rules="rules"
        class="product-edit-form"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productFormData.name" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            type="textarea"
            v-model="productFormData.description"
            :rows="4"
            placeholder="请输入商品描述 (500字以内)"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="商品价格 (元)" prop="price">
          <el-input-number
            v-model="productFormData.price"
            :precision="2"
            :step="0.01"
            :min="0.01"
            placeholder="请输入价格"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="商品图片URL" prop="imageUrl">
          <el-input v-model="productFormData.imageUrl" placeholder="请输入商品图片的URL" />
          <el-image
            v-if="productFormData.imageUrl"
            :src="productFormData.imageUrl"
            fit="contain"
            style="max-height: 50vh; margin-top: 10px; border:1px solid #eee;"
            :preview-src-list="[productFormData.imageUrl]"
            hide-on-click-modal
            />
        </el-form-item>

        <el-form-item>
          <BaseButton type="primary" @click="submitForm">提交</BaseButton>
          <BaseButton type="default" @click="resetForm">重置</BaseButton>
        </el-form-item>

        <el-alert v-if="submitError" :title="submitError" type="error" show-icon closable @close="submitError = null" />

      </el-form>
      <el-empty v-else description="未能加载到要编辑的商品信息。" />

    <el-alert v-else :title="initialLoadingError || '发生错误'" type="error" show-icon />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageContainer from '@/components/PageContainer.vue';
import { useProductStore } from '@/stores/products';
import type { Product, UpdateProductDTO } from '@/types/product'; // Product 和 UpdateProductDTO
import { ElMessage, ElForm, ElInput, ElButton, ElInputNumber, ElCard, ElAlert, ElEmpty, ElSkeleton, ElImage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import BaseButton from '@/components/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();

const productToEdit = ref<Product | null>(null); // 存储从服务器加载的原始商品数据
const isLoading = ref(true); // 页面初始加载商品数据的状态
const initialLoadingError = ref<string | null>(null);
const isSubmitting = ref(false); // 表单提交状态
const submitError = ref<string | null>(null);

const productId = computed(() => Number(route.params.productId));
const isEditMode = computed(() => !!productToEdit.value && !!productId.value);
const pageTitle = computed(() => isEditMode.value ? `修改商品: ${productToEdit.value?.name}` : '加载商品信息...');

// 表单数据模型 - UpdateProductDTO 需要 storeId, name, description, price, imageUrl
// CreateProductDTO 也需要这些，除了 storeId 是在 CreateProductDTO 中直接的
const productFormData = reactive<Omit<UpdateProductDTO, 'storeId'>>({ // storeId 会从 productToEdit.value 获取
  name: '',
  description: '',
  price: 0.01, // 默认值
  imageUrl: '',
});

// 表单校验规则 (与 ProductApplicationForm.vue 类似)
const rules = ref<FormRules>({
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { max: 500, message: '商品描述不能超过500个字符', trigger: 'input' },
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', message: '价格必须是数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value <= 0) callback(new Error('价格必须大于0'));
        else callback();
      }, trigger: 'blur'},
  ],
  imageUrl: [
    { required: true, message: '请输入商品图片URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: ['blur', 'change'] },
  ],
});
const formRef = ref<FormInstance>();
const fileList = ref([]);

const handleUploadSuccess = (response: any, file: any) => {
  productFormData.imageUrl = response.url;
  ElMessage.success('图片上传成功');
};

// 加载要编辑的商品数据
const loadProductForEdit = async (id: number) => {
  if (isNaN(id) || id <= 0) {
    initialLoadingError.value = "无效的商品ID";
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  initialLoadingError.value = null;
  productToEdit.value = null; // 先清空

  try {
    const fetchedProduct: Product | null = await productStore.fetchProductById(id); // <--- 调用 action 并接收返回值

    console.log('[ProductEditForm] Fetched product from store action:', JSON.parse(JSON.stringify(fetchedProduct)));

    if (fetchedProduct) { // <--- 现在 fetchedProduct 的类型是 Product | null，可以正确判断
      productToEdit.value = fetchedProduct;
      // 预填充表单
      productFormData.name = fetchedProduct.name;
      productFormData.description = fetchedProduct.description;
      productFormData.price = fetchedProduct.price;
      productFormData.imageUrl = fetchedProduct.imageUrl;
      // 如果还有 storeId，也需要从 fetchedProduct 中获取
      // (UpdateProductDTO 需要 storeId, 它会从 productToEdit.value.storeId 取)
      console.log('[ProductEditForm] productToEdit.value set:', JSON.parse(JSON.stringify(productToEdit.value)));
    } else {
      initialLoadingError.value = "未能找到要编辑的商品，或加载失败。";
      productToEdit.value = null; // 确保清空
    }
  } catch (error: any) { // 如果 store action throw err, 会在这里被捕获
    console.error("Failed to load product for editing (error from store action):", error);
    initialLoadingError.value = error.message || "加载商品信息时发生严重错误。";
    productToEdit.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (productId.value) {
    loadProductForEdit(productId.value);
  } else {
    initialLoadingError.value = "未提供商品ID用于编辑。";
    isLoading.value = false;
  }
});

const handleSubmit = async () => {
  if (!formRef.value || !productToEdit.value || !productToEdit.value.storeId) {
    submitError.value = "表单或原始商品数据无效。";
    return;
  }

  try {
    await formRef.value.validate();
    isSubmitting.value = true;
    submitError.value = null;

    const updateData: UpdateProductDTO = {
      storeId: productToEdit.value.storeId, // 从加载的原始商品数据中获取 storeId
      name: productFormData.name,
      description: productFormData.description,
      price: Number(productFormData.price),
      imageUrl: productFormData.imageUrl,
    };

    // 注意：API 文档中 `PUT /product-applications/{productId}` 是修改商品 *申请*
    // 而我们现在是商户直接修改已上架商品的信息，然后提交一个 *修改申请*
    // 所以，这里应该调用的是 `productStore.applyForProductModification(productToEdit.value.id, updateData)`
    // 这个 action 内部会调用 `productService.updateProductApplication(productId, data)`
    // productId 应该是被修改的商品的ID

    await productStore.applyForProductModification(productToEdit.value.id, updateData);

    ElMessage.success('商品信息修改申请已提交！');
    // 提交成功后，可以跳转到申请列表或商品详情页
    router.push({ name: 'ProductApplicationList' }); // 或者 router.push({ name: 'ProductDetail', params: { productId: productToEdit.value.id } });

  } catch (validationError) { // catch for form validation
    // ElForm 的 validate 失败时，通常不会抛出到这里，除非是 Promise.reject()
    // 如果是 Element Plus 的 validate 回调风格，则在回调中处理
    // 如果是 Promise 风格，校验失败会 reject 一个包含错误信息的对象
    ElMessage.error('表单校验失败，请检查输入项。');
    console.log("Validation failed:", validationError);
    isSubmitting.value = false;
  }
  // The try-catch in applyForProductModification (in store) will handle API errors
  // and set productStore.error, which we are not directly displaying here, but could.
  // We set our own submitError for form-specific issues.
  isSubmitting.value = false; // Ensure this is reset in all paths if API call fails
};

const submitForm = async () => {
  await handleSubmit();
};

const resetForm = () => {
  formRef.value.resetFields();
};

const goBack = () => {
  router.back(); // 或者 router.push({ name: 'ProductDetail', params: { productId: productId.value }})
};

</script>

<style scoped>
/* 可以从 ProductApplicationForm.vue 复制一些通用样式 */
.el-card {
  margin-bottom: 20px;
}
.el-alert {
  margin-top: 15px;
}

.product-edit-form {
  width: 60vw;
  background: white;
  padding: 4vh 2vw;
  border-radius: 1vh;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
  width: 15vh;
  font-size: 1.9vh;
  font-weight: 600;
  color: #15324d;
  margin-right: 1vh;  
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  height: 3vh;
  box-shadow: none;
  border: 1px solid var(--el-border-color);
  transition: all 0.2s;
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

</style>