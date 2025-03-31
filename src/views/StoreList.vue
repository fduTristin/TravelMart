<script setup lang="ts">
import { ref, computed } from 'vue'
import StoreCard from '@/components/StoreCard.vue'
import PageContainer from '@/components/PageContainer.vue'
import { useRouter } from 'vue-router'
import { useStoreStore, ServiceType } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const storeStore = useStoreStore()
const authStore = useAuthStore()

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

// 创建新店铺
const handleCreateStore = () => {
  if (!authStore.isMerchant) {
    ElMessage.warning('只有商户才能开设店铺')
    return
  }
  router.push('/stores/create')
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <div class="header-container">
        <!-- <h1>店铺列表</h1> -->
        <div class="header-actions">
          <el-select
            v-model="selectedType"
            placeholder="选择服务类型"
            clearable
            class="type-filter"
          >
            <el-option
              v-for="type in Object.values(ServiceType)"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
          <el-button type="primary" @click="handleCreateStore">
            <el-icon><Plus /></el-icon>
            开设新店铺
          </el-button>
        </div>
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
  width: 200px;
}

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 16px;
  margin: 0 auto;
}

.store-grid-item {
  min-width: 0;
  height: 100%;
  transition: transform 0.3s ease;
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

  .header-actions {
    flex-direction: column;
  }

  .type-filter {
    width: 100%;
  }
}

.store-grid-item:hover {
  transform: translateY(-4px);
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
