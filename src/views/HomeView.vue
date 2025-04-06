<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElCard, ElButton, ElSelect, ElOption } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import StoreCard from '@/components/StoreCard.vue'
import { useStoreStore } from '@/stores/stores'
import { useRouter } from 'vue-router'

enum ServiceType {
  HOTEL = '酒店',
  TRANSPORT = '交通',
  RESTAURANT = '餐饮',
  TICKET = '景区门票'
}

const router = useRouter()
const storeStore = useStoreStore()
const selectedType = ref<ServiceType | null>(null)
const currentStore = ref(null) // 初始化为 null

// 切换服务类型
const handleTypeChange = (type: ServiceType | null) => {
  selectedType.value = type
  if (type) {
    currentStore.value = storeStore.getRandomStoreByType(type)
  } else {
    currentStore.value = storeStore.getRandomStore()
  }
}

const timer = ref<number | null>(null)

// 切换到下一个店铺
const nextStore = () => {
  if (selectedType.value) {
    const stores = storeStore.getStoresByType(selectedType.value)
    const currentIndex = stores.findIndex(store => store.id === currentStore.value?.id)
    currentStore.value = stores[(currentIndex + 1) % stores.length]
  } else {
    currentStore.value = storeStore.nextStore()
  }
}

// 切换到上一个店铺
const prevStore = () => {
  if (selectedType.value) {
    const stores = storeStore.getStoresByType(selectedType.value)
    const currentIndex = stores.findIndex(store => store.id === currentStore.value?.id)
    currentStore.value = stores[(currentIndex - 1 + stores.length) % stores.length]
  } else {
    currentStore.value = storeStore.prevStore()
  }
}

// 跳转到店铺详情
const goToStore = () => {
  if (currentStore.value) {
    router.push(`/stores/${currentStore.value.id}`)
  }
}

// 自动轮播
const startAutoPlay = () => {
  timer.value = window.setInterval(() => {
    nextStore()
  }, 5000) // 每5秒切换一次
}

// 停止自动轮播
const stopAutoPlay = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 加载店铺数据
onMounted(async () => {
  try {
    await storeStore.fetchStores() // 确保数据加载完成
    currentStore.value = storeStore.getRandomStore() // 设置初始店铺
    startAutoPlay()
  } catch (error) {
    console.error('Failed to load stores:', error)
  }
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <PageContainer>
    <div class="home-content">
      <div class="hero-section">
        <h1>椰树牌旅游商城</h1>
      </div>
      <div class="store-showcase">
        <div class="showcase-header">
          <h2>店铺推荐</h2>
          <el-select v-model="selectedType" placeholder="选择服务类型" clearable @change="handleTypeChange">
            <el-option v-for="type in Object.values(ServiceType)" :key="type" :label="type" :value="type" />
          </el-select>
        </div>
        <div class="store-card-wrapper">
          <div v-if="currentStore" class="store-card-container" @click="goToStore">
            <StoreCard :store="currentStore" class="custom-store-card" />
          </div>
          <div v-else class="loading-placeholder">
            <p>加载中...</p>
          </div>
          <div class="nav-button prev" @click.stop="prevStore">
            <el-button circle :icon="ArrowLeft" />
          </div>
          <div class="nav-button next" @click.stop="nextStore">
            <el-button circle :icon="ArrowRight" />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.home-content {
  padding: 0;
  text-align: center;
}

.hero-section {
  margin-top: 0;
  margin-bottom: 5vh;
}

.hero-section h1 {
  font-size: 5vh;
  color: #2B3A67;
  font-weight: 700;
}

.store-showcase {
  max-width: 50vw;
  margin: 0 auto;
  padding: 0;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4vh;
}

.showcase-header h2 {
  font-size: 4vh;
  color: #2B3A67;
  margin: 0;
}

.showcase-header :deep(.el-select) {
  width: 9vw;
}

.store-card-wrapper {
  height: 50vh;
  position: relative;
}

.store-card-container {
  margin-bottom: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.store-card-container:hover {
  transform: translateY(-5px);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.nav-button:hover {
  opacity: 1;
}

.nav-button.prev {
  left: -2vw;
}

.nav-button.next {
  right: -2vw;
}

.nav-button :deep(.el-button) {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.custom-store-card :deep(.image) {
  height: 40vh; /* 修改图片高度 */
}

.custom-store-card {
  width: 50vw;
  height: 54vh /* 修改卡片高度 */
}

:deep(.el-select__wrapper) {
  width: 9vw;
  height: 4vh;
  border-radius: 1vh;
}
</style>