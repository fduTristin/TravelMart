<script setup lang="ts">
import { ref, computed } from 'vue'
import StoreCard from '@/components/StoreCard.vue'
import PageContainer from '@/components/PageContainer.vue'
import { useRouter } from 'vue-router'
import { useStoreStore, ServiceType } from '@/stores/store'

const router = useRouter()
const storeStore = useStoreStore()

// 服务类型筛选
const selectedType = ref<ServiceType | null>(null)

// 根据筛选条件获取店铺列表
const filteredStores = computed(() => {
  if (selectedType.value === null) {
    return storeStore.stores
  }
  return storeStore.getStoresByType(selectedType.value)
})

const handleStoreClick = (storeId: number) => {
  // 跳转到店铺详情页
  router.push(`/store/${storeId}`)
}
</script>

<template>
  <PageContainer>
    <template #header>
      <div class="header-container">
        <h1>店铺列表</h1>
        <select v-model="selectedType" class="type-filter">
          <option :value="null">全部类型</option>
          <option v-for="type in Object.values(ServiceType)" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
    </template>

    <div class="store-grid">
      <div
        v-for="store in filteredStores"
        :key="store.storeId"
        class="store-grid-item"
        @click="handleStoreClick(store.storeId)"
      >
        <StoreCard :store="store" />
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.type-filter {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.type-filter:hover {
  border-color: #409eff;
}

.type-filter:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 16px;
  margin: 0 auto;
  max-width: 1440px;
}

.store-grid-item {
  min-width: 0;
  height: 100%;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .store-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 12px;
  }
}

.store-grid-item:hover {
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .store-grid {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  .header-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>