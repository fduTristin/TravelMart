<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StoreCard from '@/components/StoreCard.vue'
import PageContainer from '@/components/PageContainer.vue'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/stores'
import { ServiceType } from '@/types/store'
import { useAuthStore } from '@/stores/auth'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const storeStore = useStoreStore()
const authStore = useAuthStore()

// 服务类型筛选
const selectedCategory = ref<ServiceType | null>(null)

// 根据筛选条件获取店铺列表
const filteredStores = computed(() => {
  let stores = storeStore.stores;

  // 应用服务类型筛选
  if (selectedCategory.value !== null) {
    const category = selectedCategory.value
    stores = stores.filter(store => store.categories.includes(category));
  }

  return stores;
})

const handleStoreClick = (id: number) => {
  // 跳转到店铺详情页
  router.push(`/stores/${id}`)
}

// 创建新店铺
const handleCreateStore = () => {
  if (!authStore.isMerchant) {
    ElMessage.warning('只有商户才能开设店铺')
    return
  }
  router.push('/stores/create')
}

// 加载店铺列表
onMounted(async () => {
  const loadingInstance = ElLoading.service({
    target: '.store-grid',
    text: '加载店铺数据中...'
  })

  try {
    await storeStore.fetchStores()
  } catch (error) {
    ElMessage.error('加载店铺列表失败')
  } finally {
    loadingInstance.close()
  }
})
</script>

<template>
  <PageContainer>
    <template #actions>
      <div class="header-actions">
        <el-select v-model="selectedCategory" placeholder="选择服务类型" clearable class="type-filter">
          <el-option v-for="type in Object.values(ServiceType)" :key="type" :label="type" :value="type" />
        </el-select>
        <div v-if="authStore.isMerchant" class="header-actions">
          <BaseButton type="primary" @click="handleCreateStore">
            <el-icon>
              <Plus />
            </el-icon>
            开设新店铺
          </BaseButton>
        </div>
      </div>
    </template>

    <div class="store-grid">
      <div v-for="store in filteredStores" :key="store.id" class="store-grid-item" @click="handleStoreClick(store.id)">
        <StoreCard :store="store" />
      </div>
      <div v-if="filteredStores.length === 0" class="empty-state">
        <p>{{ authStore.isMerchant && !authStore.isAdmin ? '您还没有开设店铺' : '没有找到符合条件的店铺' }}</p>
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

.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(22vw, 1fr));
  gap: 2vw;
  padding: 2vh 1vw;
  margin: 0 auto;
  place-items: center;
}

.store-grid-item {
  min-width: 0;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .store-grid {
    grid-template-columns: 1fr;
    padding: 2vh 4vw;
    gap: 3vh;
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
  gap: 2vw;
  align-items: center;
}

:deep(.el-select__wrapper) {
  width: 11vw;
  height: 5vh;
  border-radius: 1vh;
}
</style>
