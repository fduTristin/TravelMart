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
                <span v-else>店铺ID: {{ product.storeId }}</span>
              </el-descriptions-item>

              <el-descriptions-item label="商品状态">
                <el-tag :type="getProductStatusTag(product.status)">
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
              <div v-if="authStore.isMerchant && authStore.userId === product.storeOwnerId">
                 <el-button type="primary" @click="navigateToEditProduct(product.id)">修改商品</el-button>
                <el-button type="danger" @click="confirmRemoveProduct(product.id)">下架商品</el-button>
              </div>
               <div v-if="authStore.isAdmin" style="margin-top:10px;">
                <el-button type="warning" plain @click="adminManageProduct(product.id)">管理商品 (Admin)</el-button>
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
import PageContainer from '@/components/PageContainer.vue'; // 假设有这个页面容器组件
import { useProductStore } from '@/stores/products';
import { useStoreStore } from '@/stores/stores'; // 用于获取店铺名称
import { useAuthStore } from '@/stores/auth';
import type { Product } from '@/types/product';
import { ProductStatus } from '@/types/product'; // 引入 ProductStatus 枚举
import { ElRow, ElCol, ElCard, ElImage, ElDescriptions, ElDescriptionsItem, ElTag, ElButton, ElEmpty, ElSkeleton, ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const storeStore = useStoreStore();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const isLoading = ref(true);
const fetchError = ref<string | null>(null);
const storeName = ref<string | null>(null);

const pageTitle = computed(() => product.value ? `商品详情: ${product.value.name}` : '加载商品详情...');
const productId = computed(() => Number(route.params.productId));

const loadProductDetails = async (id: number) => {
  if (isNaN(id) || id <= 0) { /* ... */ }
  isLoading.value = true;
  fetchError.value = null;
  try {
    await productStore.fetchProductDetails(id); // 调用 store action
    product.value = productStore.currentProduct; // 从 store 获取更新后的当前商品

    if (product.value) {
      // 获取店铺名称等后续操作...
      if (product.value.storeId) {
        if (storeStore.stores.length === 0 && !storeStore.loading) { // 避免重复加载
          await storeStore.fetchStores();
        }
        const store = storeStore.stores.find(s => s.id === product.value!.storeId);
        storeName.value = store ? store.storeName : null;
      }
    } else {
      fetchError.value = '商品未找到。';
    }
  } catch (error: any) {
    console.error('Failed to load product details in component:', error);
    fetchError.value = error.message || '加载商品详情失败。';
    product.value = null;
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
    return new Date(dateTimeString).toLocaleString('zh-CN', { hour12: false });
  } catch (e) { return dateTimeString; }
};

const formatProductStatus = (statusKey?: ProductStatus | string | null): string => {
  if (!statusKey) return '状态未知';
  // 假设 ProductStatus 枚举的值就是后端返回的字符串
  // 例如: ProductStatus.ON_SHELF = 'ON_SHELF'
  // 你可能需要一个映射表，如果枚举名和后端值不同
  switch (String(statusKey).toUpperCase()) {
    case ProductStatus.ON_SHELF: return '销售中';
    case ProductStatus.OFF_SHELF: return '已下架';
    case ProductStatus.PENDING_APPROVAL: return '待审核';
    case ProductStatus.APPROVAL_FAILED: return '审核失败';
    default: return String(statusKey);
  }
};

const getProductStatusTag = (statusKey?: ProductStatus | string | null): ('success' | 'warning' | 'danger' | 'info') => {
  if (!statusKey) return 'info';
  switch (String(statusKey).toUpperCase()) {
    case ProductStatus.ON_SHELF: return 'success';
    case ProductStatus.OFF_SHELF: return 'info';
    case ProductStatus.PENDING_APPROVAL: return 'warning';
    case ProductStatus.APPROVAL_FAILED: return 'danger';
    default: return 'info';
  }
};

// --- 商户和管理员操作占位 ---
const navigateToEditProduct = (id: number) => {
  // TODO: 跳转到商品编辑页面，例如
  // router.push({ name: 'ProductEdit', params: { productId: id } });
  ElMessage.info(`功能待开发：编辑商品 ID ${id}`);
};

const confirmRemoveProduct = async (id: number) => {
  // TODO: 实现下架逻辑
  try {
    await ElMessageBox.confirm(
        `确定要下架该商品 (ID: ${id}) 吗？此操作会将商品状态变为“已下架”。`,
        '下架确认',
        { confirmButtonText: '确定下架', cancelButtonText: '取消', type: 'warning' }
    );
    // 用户点击了确定
    // await productStore.takeProductOffShelf(id); // 假设有这个action
    ElMessage.success(`商品 (ID: ${id}) 已成功下架！(模拟)`);
    // 可能需要刷新当前商品信息或导航离开
    // loadProductDetails(id);
  } catch (action) {
    if (action === 'cancel') {
        ElMessage.info('已取消下架操作。');
    }
  }
};

const adminManageProduct = (id: number) => {
  ElMessage.info(`功能待开发：管理员管理商品 ID ${id}`);
};


onMounted(() => {
  loadProductDetails(productId.value);
});

watch(
  () => route.params.productId,
  (newId) => {
    if (newId && Number(newId) !== product.value?.id) { // 仅当ID实际改变时才重新加载
      loadProductDetails(Number(newId));
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
  margin-bottom: 15px;
}
.store-link {
  color: var(--el-color-primary);
  text-decoration: none;
}
.store-link:hover {
  text-decoration: underline;
}
.product-description-full {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
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
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}
.action-buttons .el-button {
  margin-right: 10px;
}
.el-descriptions { /* 给描述列表一些外边距 */
    margin-bottom: 20px;
}

</style>