<script setup lang="ts">
const getServiceTypeStyle = (type: ServiceType) => {
  const styles = {
    [ServiceType.HOTEL]: { backgroundColor: '#409EFF', color: 'white' },
    [ServiceType.TRANSPORT]: { backgroundColor: '#67C23A', color: 'white' },
    [ServiceType.RESTAURANT]: { backgroundColor: '#E6A23C', color: 'white' },
    [ServiceType.TICKET]: { backgroundColor: '#F56C6C', color: 'white' }
  }
  return styles[type] || {}
}

const getServiceTypeKey = (category: string): ServiceType | null => {
  const keys = Object.keys(ServiceType) as Array<keyof typeof ServiceType>
  const foundKey = keys.find(key => ServiceType[key] === category)
  return foundKey ? ServiceType[foundKey] : null
}

import type { Store } from '@/types/store'
import { ServiceType } from '@/types/store'

defineProps<{
  store: Store
}>()
</script>

<template>
  <el-card class="store-card" :body-style="{ padding: '0px' }">
    <img :src="store.imageUrl || '/default-store.jpg'" class="image" />
    <div class="store-info">
      <div class="store-header">
        <h3>{{ store.storeName }}</h3>
      </div>
      <div class="categories">
        <span v-for="category in store.categories.split(',')" :key="category" class="category-tag"
          :style="getServiceTypeStyle(getServiceTypeKey(category) || ServiceType.HOTEL)">
          {{ category }}
        </span>
      </div>

      <!-- <div class="rating">
        <el-rate v-model="store.rating" disabled show-score text-color="#ff9900" />
      </div> -->
      <!-- <div class="status" :class="{ 'is-open': store.isOpen }">
        {{ store.isOpen ? '营业中' : '休息中' }}
      </div> -->
      <!-- <p class="description">简介: {{ store.description }}</p> -->
    </div>
  </el-card>
</template>

<style scoped>
.store-card {
  background: white;
  border-radius: 1vh;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  width: 100%;
  height: 30vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.store-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.image {
  width: 100%;
  height: 20vh;
  object-fit: cover;
  object-position: center;
}

.store-info {
  margin-left: 1vw;
  margin-right: 1vw;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 0;
}

.store-header h3 {
  margin: 0;
  font-size: 2vh;
  font-weight: 600;
}

.categories {
  display: flex;
  gap: 0.5vw;
  flex-wrap: wrap;
}

.category-tag {
  padding: 0.2vh 0.5vw;
  border-radius: 0.2vw;
  font-size: 1.6vh;
  font-weight: 500;
}

.rating {
  margin-bottom: 12px;
}

.description {
  margin-bottom: 1vh;
  font-size: 1.5vh;
  color: #5c6b7c;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>