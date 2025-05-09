<template>
  <PageContainer :title="pageTitle">
    <div v-if="isLoading" class="loading-placeholder">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="fetchError || !product" class="error-placeholder">
      <el-empty :description="fetchError || '商品未找到或加载失败'" />
    </div>
    <div v-else class="product-detail-layout">
      <el-row :gutter="30">
        <el-col :xs="24" :sm="24" :md="10" :lg="10" class="product-image-section">
          <el-card shadow="hover" class="image-card">
            <el-image
              :src="product.imageUrl || '/placeholder-product-large.jpg'"
              :alt="product.name"
              fit="contain"
              class="main-product-image"
              :preview-src-list="product.imageUrl ? [product.imageUrl] : []"
              hide-on-click-modal
              lazy
            />
            </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="14" :lg="14" class="product-info-section">
          <el-card shadow="hover">
            <template #header>
              <h1 class="product-title">{{ product.name }}</h1>
            </template>

            <el-descriptions :column="1" border size="large">
              <el-descriptions-item label="价格">
                <span class="product-price">{{ formatPrice(product.price) }}</span>
              </el-descriptions-item>

              <el-descriptions-item label="所属店铺">
                <router-link v-if="storeName" :to="`/stores/${product.storeId}`" class="store-link">
                  {{ storeName }} (ID: {{ product.storeId }})
                </router-link>
                <span v-else-if="product.storeId">店铺ID: {{ product.storeId }}</span>
                <span v-else>未知店铺</span>
              </el-descriptions-item>

              <el-descriptions-item label="商品状态">
                <el-tag :type="getProductStatusTag(product.status)" disable-transitions>
                  {{ formatProductStatus(product.status) }}
                </el-tag>
              </el-descriptions-item>

              <el-descriptions-item label="上架时间">
                {{ formatGenericDateTime(product.createdAt) }}
              </el-descriptions-item>
               <el-descriptions-item label="最后更新">
                {{ formatGenericDateTime(product.updatedAt) }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="product-description-full">
              <h3>商品详情</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="action-buttons">
              <div v-if="authStore.isMerchant && productStoreData && authStore.userId === productStoreData.ownerId" class="merchant-actions">
                <el-button type="primary" @click="navigateToEditProduct(product!.id)">修改商品</el-button>
                <el-button type="danger" @click="confirmRemoveProduct(product!.id)">下架商品</el-button>
              </div>
               <div v-if="authStore.isAdmin" style="margin-top:10px;">
                <el-button type="warning" plain @click="adminManageProduct(product!.id)">管理商品 (Admin)</el-button>
              </div>
              </div>

          </el-card>
        </el-col>
      </el-row>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageContainer from '@/components/PageContainer.vue';
import { useProductStore } from '@/stores/products';
import { useStoreStore } from '@/stores/stores';
import { useAuthStore } from '@/stores/auth';
import type { Product } from '@/types/product';
import { ProductStatus as ProductStatusEnum } from '@/types/product'; // 确保 ProductStatusEnum 导入
import type { Store } from '@/types/store'; // 引入 Store 类型
import {
    ElRow, ElCol, ElCard, ElImage, ElDescriptions, ElDescriptionsItem, ElTag, ElButton,
    ElEmpty, ElSkeleton, ElMessage, ElMessageBox
} from 'element-plus';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const storeStore = useStoreStore();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const productStoreData = ref<Store | null>(null); // <--- 新增: 用于存储当前商品所属的店铺对象
const storeName = ref<string | null>(null); // 保留，用于显示店铺名称

const isLoading = ref(true);
const fetchError = ref<string | null>(null);

const pageTitle = computed(() => product.value ? `商品详情: ${product.value.name}` : '加载商品详情...');
const productId = computed(() => Number(route.params.productId));

const loadProductDetails = async (id: number) => {
  if (isNaN(id) || id <= 0) {
    fetchError.value = '无效的商品ID';
    isLoading.value = false;
    product.value = null;
    productStoreData.value = null;
    storeName.value = null;
    return;
  }
  isLoading.value = true;
  fetchError.value = null;
  product.value = null;
  productStoreData.value = null;
  storeName.value = null;

  try {
    const fetchedProduct = await productStore.fetchProductById(id); // 或 fetchProductDetails

    if (fetchedProduct) {
      product.value = fetchedProduct;

      if (fetchedProduct.storeId) { // 确保后端返回的 product 对象里有 storeId
        // 获取店铺信息 (用于显示店铺名称和判断ownerId)
        if (storeStore.stores.length === 0 && !storeStore.loading) {
          await storeStore.fetchStores(); // 加载所有店铺列表（如果尚未加载）
        }
        // 从店铺列表中查找当前商品所属的店铺
        const foundStore = storeStore.stores.find(s => s.id === fetchedProduct.storeId);
        if (foundStore) {
          productStoreData.value = foundStore; // <--- 关键: 将店铺对象存起来
          storeName.value = foundStore.storeName;
          console.log('[ProductDetail] productStoreData set:', JSON.parse(JSON.stringify(productStoreData.value))); // <--- 添加日志
        } else {
          console.warn(`[ProductDetail] Store with ID ${fetchedProduct.storeId} not found in storeStore.stores.`);
          productStoreData.value = null; // 未找到店铺，则设为null
          storeName.value = `店铺ID: ${fetchedProduct.storeId} (名称未找到)`;
        }
      } else {
        console.warn(`[ProductDetail] Product ID ${fetchedProduct.id} loaded, but does not have a storeId.`);
        productStoreData.value = null; // 商品没有 storeId，则店铺信息为null
        storeName.value = '未知店铺';
      }
    } else {
      fetchError.value = '商品未找到或加载失败。';
      product.value = null;
      productStoreData.value = null; // 获取商品失败，店铺信息也为null
    }
  } catch (error: any) {
    console.error('Failed to load product details in component:', error);
    fetchError.value = error.message || '加载商品详情失败。';
    product.value = null;
    productStoreData.value = null; // 出错时，店铺信息也为null
  } finally {
    isLoading.value = false;
  }
};

// --- 格式化辅助函数 ---
const formatPrice = (price: number | undefined) => {
  if (typeof price === 'number') return `¥ ${price.toFixed(2)}`;
  return '价格面议';
};

const formatGenericDateTime = (dateTimeString?: string | null) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch (e) { return dateTimeString; }
};

// 修改：直接使用导入的 ProductStatusEnum
const formatProductStatus = (statusKey?: ProductStatusEnum | string | null): string => {
  if (!statusKey) return '状态未知';
  switch (String(statusKey).toUpperCase()) {
    case ProductStatusEnum.ON_SHELF: return '销售中';
    case ProductStatusEnum.OFF_SHELF: return '已下架';
    case ProductStatusEnum.PENDING_APPROVAL: return '待审核';
    case ProductStatusEnum.APPROVAL_FAILED: return '审核失败';
    default: return String(statusKey);
  }
};

const getProductStatusTag = (statusKey?: ProductStatusEnum | string | null): ('success' | 'warning' | 'danger' | 'info') => {
  if (!statusKey) return 'info';
  switch (String(statusKey).toUpperCase()) {
    case ProductStatusEnum.ON_SHELF: return 'success';
    case ProductStatusEnum.OFF_SHELF: return 'info';
    case ProductStatusEnum.PENDING_APPROVAL: return 'warning';
    case ProductStatusEnum.APPROVAL_FAILED: return 'danger';
    default: return 'info';
  }
};

// --- 操作按钮的函数 ---
const navigateToEditProduct = (currentProductId: number | undefined) => {
  if (!currentProductId) {
    ElMessage.error('无法编辑：商品ID无效。');
    return;
  }
  // 确保 productStoreData.value (即店铺信息) 也已加载，因为编辑表单可能需要 storeId
  if (!productStoreData.value || !productStoreData.value.id) {
      ElMessage.error('无法编辑：商品所属店铺信息不完整。');
      return;
  }
  console.log(`Navigating to edit page for product ID: ${currentProductId}, from store ID: ${productStoreData.value.id}`);
  router.push({
    name: 'ProductEdit', // 确保路由名称正确
    params: {
      // 如果 ProductEditForm 也需要 storeId 作为路由参数 (例如 /stores/:storeId/products/:productId/edit)
      // storeId: productStoreData.value.id,
      productId: currentProductId
    }
  });
};

const confirmRemoveProduct = async (currentProductId: number | undefined) => {
  if (!currentProductId || !product.value) {
    ElMessage.error('无效商品ID或商品数据未加载。');
    return;
  }

  try {
    // 1. 弹出确认框，让用户二次确认
    await ElMessageBox.confirm(
      `确定要下架商品 “${product.value.name}” (ID: ${currentProductId}) 吗？商品将不再对顾客可见。`,
      '下架确认',
      {
        confirmButtonText: '确定下架',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 2. 用户点击了“确定下架”，显示处理中消息
    ElMessage({ type: 'info', message: '正在下架商品...', duration: 1500 });

    // 3. 调用 store action 执行下架操作
    await productStore.takeProductOffShelf(currentProductId);

    // 4. API 调用成功后，显示成功消息
    ElMessage.success(`商品 “${product.value.name}” 已成功下架！`);

    // 5. 更新当前页面的商品状态显示
    //    (productStore.takeProductOffShelf action 内部也应该更新了 currentProduct.status)
    //    这里再次确保 product ref 的状态也同步，如果它们不是同一个对象引用的话
    if (product.value && product.value.id === currentProductId) {
      product.value.status = ProductStatusEnum.OFF_SHELF; // 使用导入的枚举
    }

    // 6. (可选) 可以在此处添加其他UI反馈，例如禁用“下架”按钮，
    //    或者几秒后自动导航离开此页面等。
    //    例如:
    //    const offShelfButton = document.getElementById(`offshelf-btn-${currentProductId}`); // 假设按钮有这样的ID
    //    if (offShelfButton) offShelfButton.disabled = true;

  } catch (actionOrError) {
    // 这个 catch 会捕获 ElMessageBox.confirm 的 reject (当用户点击取消或关闭时)
    // 以及 productStore.takeProductOffShelf action 抛出的错误

    if (actionOrError === 'cancel' || String(actionOrError).toLowerCase() === 'close' || (actionOrError instanceof Error && String(actionOrError.message).toLowerCase().includes('cancel'))) {
      ElMessage.info('已取消下架操作。');
    } else {
      // 如果是 store action 抛出的错误，productStore.error 应该已经被设置了
      console.error(`下架商品 (ID: ${currentProductId}) 操作失败:`, actionOrError);
      ElMessage.error(productStore.error || `下架失败: ${ (actionOrError as Error)?.message || '未知错误' }`);
    }
  }
};

const adminManageProduct = (currentProductId: number | undefined) => {
  if (!currentProductId) { ElMessage.error('无效商品ID'); return; }
  ElMessage.info(`功能待开发：管理员管理商品 ID ${currentProductId}`);
};


onMounted(() => {
  console.log('[ProductDetail] Current authStore.userId:', authStore.userId);
  console.log('[ProductDetail] Current authStore.isMerchant:', authStore.isMerchant);
  if (productId.value) {
    loadProductDetails(productId.value);
  } else {
    fetchError.value = "商品ID缺失，无法加载详情。";
    isLoading.value = false;
  }
});

watch(
  () => route.params.productId,
  (newIdParam) => {
    const newId = Number(newIdParam);
    // 只有当 newId 有效，并且与当前已加载的 product.id 不同时才重新加载
    if (newId && newId > 0 && newId !== product.value?.id) {
      loadProductDetails(newId);
    }
  }
);

</script>

<style scoped>
.product-detail-layout {
  padding: 20px;
}
.loading-placeholder, .error-placeholder {
  padding: 40px;
  text-align: center;
}
.image-card, .product-info-section .el-card {
  border-radius: 8px;
}
.main-product-image {
  width: 100%;
  height: 400px; /* 或者根据需要调整 */
  display: block;
  border-radius: 4px; /* 图片本身也加圆角 */
  background-color: #f5f7fa; /* 图片加载时的背景色 */
}
.product-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 15px;
}
.product-price {
  font-size: 24px;
  font-weight: bold;
  color: #F56C6C; /* 醒目的价格颜色 */
}
.el-descriptions {
    margin-bottom: 20px;
}
.store-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}
.store-link:hover {
  text-decoration: underline;
}
.product-description-full {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.product-description-full h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #303133;
}
.product-description-full p {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap; /* 保留换行和空格 */
}
.action-buttons {
  margin-top: 24px; /* 调整与上方描述的间距 */
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex; /* 让按钮横向排列或根据需要调整 */
  gap: 10px; /* 按钮之间的间距 */
  flex-wrap: wrap; /* 如果按钮过多则换行 */
}
.merchant-actions, .admin-actions { /* 可以为不同角色的按钮组添加样式 */
    display: flex;
    gap: 10px;
}
</style>