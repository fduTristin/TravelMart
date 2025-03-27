<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElCard, ElButton, ElSelect, ElOption } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import StoreCard from '@/components/StoreCard.vue'
import { useStoreStore, ServiceType } from '@/stores/store'
import { useRouter } from 'vue-router'

const router = useRouter()
const storeStore = useStoreStore()
const selectedType = ref<ServiceType | null>(null)
const currentStore = ref(storeStore.getRandomStore())

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
    const currentIndex = stores.findIndex(store => store.storeId === currentStore.value.storeId)
    currentStore.value = stores[(currentIndex + 1) % stores.length]
  } else {
    currentStore.value = storeStore.nextStore()
  }
}

// 切换到上一个店铺
const prevStore = () => {
  if (selectedType.value) {
    const stores = storeStore.getStoresByType(selectedType.value)
    const currentIndex = stores.findIndex(store => store.storeId === currentStore.value.storeId)
    currentStore.value = stores[(currentIndex - 1 + stores.length) % stores.length]
  } else {
    currentStore.value = storeStore.prevStore()
  }
}

// 跳转到店铺详情
const goToStore = () => {
  router.push(`/store/${currentStore.value.storeId}`)
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

onMounted(() => {
  startAutoPlay()
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
        <!-- <p class="subtitle">发现城市中优质的服务</p> -->
      </div>
      <div class="store-showcase">
        <div class="showcase-header">
          <h2>店铺推荐</h2>
          <el-select
            v-model="selectedType"
            placeholder="选择服务类型"
            clearable
            @change="handleTypeChange"
          >
            <el-option
              v-for="type in Object.values(ServiceType)"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </div>
        <div class="store-card-wrapper">
          <div class="store-card-container" @click="goToStore">
            <StoreCard :store="currentStore" />
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
  padding: 40px 0;
  text-align: center;
}

.hero-section {
  margin-bottom: 60px;
}

.hero-section h1 {
  font-size: 3rem;
  color: #2B3A67;
  margin-bottom: 20px;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}

.store-showcase {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.showcase-header h2 {
  font-size: 2rem;
  color: #2B3A67;
  margin: 0;
}

.showcase-header :deep(.el-select) {
  width: 150px;
}

.store-card-wrapper {
  position: relative;
}

.store-card-container {
  margin-bottom: 20px;
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
  left: -20px;
}

.nav-button.next {
  right: -20px;
}

.nav-button :deep(.el-button) {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>