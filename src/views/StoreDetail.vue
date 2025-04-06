<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'
import { useStoreStore } from '@/stores/stores'
import type { Store } from '@/types/store'

const route = useRoute()
const storeStore = useStoreStore()

// 店铺数据
const store = ref<Store | null>(null)
const loading = ref(true)
const error = ref(false)

// 获取店铺数据
const fetchStore = async () => {
  const storeId = Number(route.params.id)
  loading.value = true
  error.value = false

  try {
    // 确保店铺列表已加载
    if (storeStore.stores.length === 0) {
      await storeStore.fetchStores()
    }
    // 查找店铺
    store.value = storeStore.stores.find(s => s.id === storeId) || null
    if (!store.value) {
      throw new Error('店铺未找到')
    }
  } catch (err) {
    console.error('Failed to fetch store:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 加载店铺数据
onMounted(() => {
  fetchStore()
})

// 监听路由参数变化
watch(
  () => route.params.id,
  () => {
    fetchStore()
  }
)
</script>

<template>
  <PageContainer>
    <div v-if="loading" class="loading-placeholder">加载中...</div>
    <div v-else-if="error" class="error-placeholder">加载店铺数据失败</div>
    <div v-else class="store-detail">
      <!-- 店铺基本信息 -->
      <div class="store-header">
        <div class="store-cover">
          <img :src="store.imageUrl" :alt="store.storeName" />
          <!-- <div class="status-badge" :class="{ 'open': store.isOpen }">
            {{ store.isOpen ? '营业中' : '已打烊' }}
          </div> -->
        </div>
        <div class="store-info">
          <h1>{{ store?.storeName }}</h1>
          <!-- <div class="rating">
            <el-rate :model-value="store.rating || 0" disabled show-score text-color="#ff9900" score-template="{value}" />
          </div> -->
          <p class="description"> 备案地址: {{ store?.registrationAddress }}</p>
          <p class="description"> 注册人身份证号: {{ store?.ownerIdNumber }}</p>
          <div class="info-grid">
            <div class="info-item">
              <span>简介: </span>
              <span>{{ store.description }}</span>
            </div>
          </div>
          <div class="categories">
            <el-tag v-for="category in store.categories.split(',')" :key="category" class="category-tag" effect="plain">
              {{ category }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.loading-placeholder,
.error-placeholder {
  text-align: center;
  font-size: 16px;
  color: #666;
}

.store-detail {
  max-width: 60vw;
  height: 80vh;
  margin: 0 auto;
}

.store-header {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
}

.store-cover {
  position: relative;
  height: 40vh;
  width: 100%;
}

.store-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f56c6c;
  color: white;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-badge.open {
  background-color: #67c23a;
}

.store-info {
  padding: 32px;
}

.store-info h1 {
  margin: 0 0 16px;
  font-size: 32px;
  color: #2c3e50;
  font-weight: 600;
}

.rating {
  margin-bottom: 20px;
}

.description {
  font-size: 16px;
  color: #5c6b7c;
  line-height: 1.8;
  margin-bottom: 1.2vh;
  max-width: 800px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 1.6vh;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 0.8vw;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 16px;
}

.categories {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.category-tag {
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
}
</style>