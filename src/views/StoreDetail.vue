<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'
import { useStoreStore } from '@/stores/store'

const route = useRoute()
const router = useRouter()
const storeStore = useStoreStore()

// 店铺数据
const store = ref(null)
const loading = ref(true)
const error = ref(false)

// 监听路由参数变化并获取店铺数据
watchEffect(() => {
  const storeId = Number(route.params.id)
  loading.value = true
  error.value = false
  
  const foundStore = storeStore.stores.find(s => s.storeId === storeId)
  if (foundStore) {
    store.value = foundStore
    loading.value = false
  } else {
    error.value = true
    loading.value = false
  }
})
</script>

<template>
  <PageContainer>
    <div class="store-detail">
      <!-- 店铺基本信息 -->
      <div class="store-header">
        <div class="store-cover">
          <img :src="store.imageUrl" :alt="store.storeName" />
          <div class="status-badge" :class="{ 'open': store.isOpen }">
            {{ store.isOpen ? '营业中' : '已打烊' }}
          </div>
        </div>
        <div class="store-info">
          <h1>{{ store.storeName }}</h1>
          <div class="rating">
            <el-rate
              v-model="store.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </div>
          <p class="description">{{ store.description }}</p>
          <div class="info-grid">
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>{{ store.address }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ store.phone }}</span>
            </div>
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>{{ store.businessHours }}</span>
            </div>
          </div>
          <div class="categories">
            <el-tag
              v-for="category in store.categories"
              :key="category"
              class="category-tag"
              effect="plain"
            >
              {{ category }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="items-section">
        <h2>商品列表</h2>
        <div class="items-grid">
          <div
            v-for="item in store.items"
            :key="item.id"
            class="item-card"
          >
            <img :src="item.imageUrl" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-price">
                <span class="price">¥{{ item.price }}</span>
                <el-button type="primary" size="small">加入购物车</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.store-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
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
  height: 400px;
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
  margin-bottom: 32px;
  max-width: 800px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  font-size: 16px;
}

.info-item .el-icon {
  font-size: 20px;
  color: #409eff;
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

.items-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.items-section h2 {
  margin: 0 0 32px;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 600;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.item-card {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.item-info {
  padding: 20px;
}

.item-info h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #2c3e50;
  font-weight: 500;
}

.item-description {
  margin: 0 0 20px;
  font-size: 14px;
  color: #5c6b7c;
  line-height: 1.6;
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
}

@media (max-width: 768px) {
  .store-detail {
    padding: 16px;
  }

  .store-cover {
    height: 250px;
  }

  .store-info {
    padding: 20px;
  }

  .store-info h1 {
    font-size: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .items-section {
    padding: 20px;
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .item-image {
    height: 200px;
  }
}
</style>