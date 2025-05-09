<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'; // 引入 computed
import { useRoute, useRouter } from 'vue-router'; // 引入 useRouter (如果需要点击商品跳转)
import PageContainer from '@/components/PageContainer.vue';
import { useStoreStore } from '@/stores/stores';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/products'; // <--- 引入 ProductStore
import type { Store } from '@/types/store';
import type { Product } from '@/types/product'; // <--- 引入 Product 类型
import { ElRow, ElCol, ElCard, ElImage, ElTag, ElButton, ElEmpty, ElSkeleton, ElSkeletonItem, ElMessage } from 'element-plus'; // <--- 引入Element Plus组件
import { Plus } from '@element-plus/icons-vue'

const route = useRoute();
const router = useRouter(); // <--- 实例化 useRouter
const storeStore = useStoreStore();
const authStore = useAuthStore();
const productStore = useProductStore(); // <--- 实例化 ProductStore

// 店铺数据
const store = ref<Store | null>(null); // 改为 Store | null，初始为 null
const storeLoading = ref(true);
const storeError = ref(false);

// 店铺下的商品数据
const products = ref<Product[]>([]);
const productsLoading = ref(false); // 商品列表的加载状态
const productsError = ref(false);   // 商品列表的错误状态

const currentStoreId = computed(() => Number(route.params.id));

// 获取店铺数据
const fetchStoreDetails = async () => {
  if (!currentStoreId.value || isNaN(currentStoreId.value)) {
    storeError.value = true;
    store.value = null;
    return;
  }
  storeLoading.value = true;
  storeError.value = false;
  try {
    if (storeStore.stores.length === 0) {
      await storeStore.fetchStores();
    }
    const storeFound = storeStore.stores.find(s => s.id === currentStoreId.value);
    if (storeFound) {
      store.value = storeFound;
      // 店铺详情加载成功后，获取该店铺的商品
      await fetchStoreProducts(currentStoreId.value);
    } else {
      store.value = null; // 清除旧数据
      throw new Error('店铺未找到');
    }
  } catch (err) {
    console.error('Failed to fetch store details:', err);
    storeError.value = true;
    store.value = null;
  } finally {
    storeLoading.value = false;
  }
};

// 获取店铺下的商品列表
const fetchStoreProducts = async (storeId: number) => {
  if (!storeId) return;
  productsLoading.value = true;
  productsError.value = false;
  try {
    // 方案2: action 返回数据 (假设 fetchStoreProducts 修改为返回 Promise<Product[]>)
    const fetchedProducts = await productStore.fetchStoreProducts(storeId); // store action 里调用 service
    // 确保只显示已上架 (ON_SHELF)
    products.value = fetchedProducts.filter(p => p.status?.toUpperCase() === 'ON_SHELF');

    console.log(`Products for store ${storeId} (after ON_SHELF filter):`, JSON.parse(JSON.stringify(products.value))); // <--- 重要日志1

  } catch (err) {
    console.error(`Failed to fetch products for store ${storeId}:`, err);
    productsError.value = true;
    products.value = [];
  } finally {
    productsLoading.value = false;
  }
};

// 点击商品卡片的操作 (示例：跳转到商品详情页，如果决定做的话)
const navigateToProductDetail = (productId: number | undefined) => {
  if (!productId) {
    ElMessage.error('无法查看详情：商品ID无效。'); // 使用 ElMessage 提示
    return;
  }
  console.log(`Navigating to product detail page for product ID: ${productId}`);
  router.push({ name: 'ProductDetail', params: { productId: productId } });
  // 确保你的商品详情页路由名称是 'ProductDetail'
  // 并且它期望一个名为 'productId' 的路由参数
};

const navigateToApplyNewProduct = () => {
  if (store.value && store.value.id) { // 确保当前店铺数据已加载且有ID
    router.push({
      name: 'product-apply-for-store', // 这是我们在 router/index.ts 中为 ProductApplicationForm.vue 配置的路由名称
      params: { storeId: store.value.id }
    });
  } else {
    ElMessage.error('店铺信息不完整，无法新增商品。'); // 确保 ElMessage 已导入
  }
};

// 加载数据
onMounted(() => {
  fetchStoreDetails(); // 这会链式调用 fetchStoreProducts
});

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      // 清空旧数据以便显示加载状态
      store.value = null;
      products.value = [];
      fetchStoreDetails();
    }
  },
  { immediate: true } // 首次加载也触发 (但 onMounted 已经处理了首次)
);

// 辅助：格式化价格 (如果商品价格需要)
const formatPrice = (price: number | undefined) => {
  if (typeof price === 'number') {
    return `¥ ${price.toFixed(2)}`;
  }
  return '价格待定';
};

</script>

<template>
  <PageContainer>
    <div v-if="storeLoading" class="loading-placeholder">
        <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="storeError || !store" class="error-placeholder">
        <el-empty description="加载店铺数据失败或店铺不存在" />
    </div>

    <div v-else class="store-detail-content">
      <div class="store-header">
        <div class="store-cover">
          <el-image :src="store.imageUrl || '/placeholder-image.jpg'" :alt="store.storeName" fit="cover" class="store-cover-image" />
        </div>
        <div class="store-info">
          <h1>{{ store.storeName }}</h1>
          <p v-if="authStore.isAdmin" class="description">商户ID: {{ store.ownerId }}</p>
          <p class="description">备案地址: {{ store.registrationAddress }}</p>
          <p class="description">注册资金: {{ store.registeredCapital }}元</p>
          <p class="description">注册时间: {{ store.registrationDate }}</p>
          <p v-if="authStore.isAdmin || (authStore.isMerchant && authStore.userId === store.ownerId)" class="description">
            注册人身份证号: {{ store.ownerIdNumber }}
          </p>
          <div class="info-item description">
            <span>简介: </span>
            <span>{{ store.description }}</span>
          </div>
          <div class="categories">
            <el-tag v-for="category in store.categories" :key="category" class="category-tag" effect="plain">
              {{ category }}
            </el-tag>
          </div>

          <div class="store-actions-bar" v-if="authStore.isMerchant && authStore.userId === store.ownerId">
            <el-button type="success" :icon="Plus" @click="navigateToApplyNewProduct">
              新增商品到本店
            </el-button>
          </div>
        </div>
      </div>

      <el-divider content-position="left"><h3>店铺商品</h3></el-divider>

      <div v-if="productsLoading" class="products-loading">
        <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="n in 4" :key="n">
                <el-card shadow="hover" style="margin-bottom: 20px;">
                    <el-skeleton animated>
                        <template #template>
                        <el-skeleton-item variant="image" style="width: 100%; height: 180px;" />
                        <div style="padding: 14px;">
                            <el-skeleton-item variant="p" style="width: 50%" />
                            <div style="display: flex; align-items: center; justify-items: space-between; margin-top: 10px;">
                            <el-skeleton-item variant="text" style="margin-right: 16px; width: 30%;" />
                            <el-skeleton-item variant="text" style="width: 30%;" />
                            </div>
                        </div>
                        </template>
                    </el-skeleton>
                </el-card>
            </el-col>
        </el-row>
      </div>
      <div v-else-if="productsError" class="error-placeholder">
        <el-empty description="加载商品列表失败" />
      </div>
      <div v-else-if="products.length > 0" class="product-list">
        <el-row :gutter="20">
          <el-col
            v-for="product in products"
            :key="product.id"
            :xs="24" :sm="12" :md="8" :lg="6" >
            <el-card shadow="hover" class="product-card" @click="navigateToProductDetail(product.id)">
              <el-image
                :src="product.imageUrl || '/placeholder-product.jpg'"
                :alt="product.name"
                fit="cover"
                class="product-image"
                lazy
              />
              <div class="product-info">
                <h4 class="product-name" :title="product.name">{{ product.name }}</h4>
                <p class="product-description" :title="product.description">
                  {{ product.description }}
                </p>
                <div class="product-price-actions">
                    <span class="product-price">{{ formatPrice(product.price) }}</span>
                    <!-- <div v-if="authStore.isMerchant && authStore.userId === store?.ownerId" class="merchant-actions">
                        <el-button type="primary" size="small" link @click="editProduct(product.id)">修改</el-button>
                        <el-button type="danger" size="small" link @click="removeProduct(product.id)">下架</el-button>
                    </div> -->
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div v-else>
        <el-empty description="该店铺暂无已上架的商品" />
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
/* 保留你之前的样式，并添加或调整商品列表的样式 */
.loading-placeholder,
.error-placeholder {
  text-align: center;
  font-size: 16px;
  color: #666;
  padding: 40px 0;
}

.store-detail-content { /* Renamed from .store-detail to avoid conflict with a possible class name */
  max-width: 80vw; /* 稍微调大宽度以容纳商品列表 */
  /* height: auto; */ /* 高度由内容决定 */
  margin: 0 auto;
  padding-bottom: 40px;
}

.store-header {
  background: white;
  border-radius: 8px; /* 调整圆角 */
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); /* Element Plus 卡片阴影风格 */
  margin-bottom: 24px; /* 调整间距 */
  display: flex;
  flex-direction: column;
}

.store-cover-image {
  width: 100%;
  height: 300px; /* 调整封面高度 */
  display: block; /* 避免图片下方小间隙 */
}

.store-info {
  padding: 24px; /* 调整内边距 */
}

.store-info h1 {
  margin: 0 0 12px; /* 调整间距 */
  font-size: 28px; /* 调整字号 */
  color: #303133;
  font-weight: 600;
}

.description {
  font-size: 14px; /* 调整字号 */
  color: #606266;
  line-height: 1.7;
  margin-bottom: 8px; /* 调整间距 */
}

.info-item { /* 如果还使用 info-item */
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}
.info-item span:first-child {
    font-weight: 500;
    color: #303133;
}


.categories {
  display: flex;
  gap: 8px; /* 调整间距 */
  flex-wrap: wrap;
  margin-top: 16px; /* 调整间距 */
}

.category-tag {
  font-size: 12px; /* 调整字号 */
  /* padding: 4px 8px; */ /* el-tag 默认有padding，可微调 */
  /* border-radius: 4px; */
}

/* 商品列表样式 */
.el-divider {
  margin: 30px 0;
}
.el-divider h3 {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
}

.product-list {
  margin-top: 20px;
}

.product-card {
  margin-bottom: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.3s ease-in-out; /* 可选：添加一个轻微的阴影过渡效果 */
}

.product-image {
  width: 100%;
  height: 180px; /* 固定图片高度 */
  display: block;
  border-bottom: 1px solid #ebeef5;
}

.product-info {
  padding: 14px;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-description {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 10px;
  height: 40px; /* 限制描述显示两行左右 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制两行 */
  -webkit-box-orient: vertical;
}

.product-price-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c; /* 价格用醒目颜色 */
}
.merchant-actions .el-button {
    padding: 0; /* Element Plus link button tends to have padding */
}
.merchant-actions .el-button + .el-button {
    margin-left: 10px;
}

</style>