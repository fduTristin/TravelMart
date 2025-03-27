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
import { ServiceType } from '@/stores/store'

interface Store {
  storeId: number
  storeName: string
  rating: number
  isOpen: boolean
  description?: string
  imageUrl?: string
  serviceType: ServiceType
}

defineProps<{
  store: Store
}>()
</script>

<template>
  <el-card class="store-card" :body-style="{ padding: '0px' }">
    <img :src="store.imageUrl" class="image" />
    <div class="store-info">
      <div class="store-header">
        <h3>{{ store.storeName }}</h3>
        <span class="service-type" :style="getServiceTypeStyle(store.serviceType)">
          {{ store.serviceType }}
        </span>
      </div>
      <div class="rating">
        <el-rate v-model="store.rating" disabled show-score text-color="#ff9900" />
      </div>
      <div class="status" :class="{ 'is-open': store.isOpen }">
        {{ store.isOpen ? '营业中' : '休息中' }}
      </div>
      <p class="description">{{ store.description }}</p>
    </div>
  </el-card>
</template>

<style scoped>
.store-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.store-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  object-position: center;
}

.store-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.store-card.closed {
  opacity: 0.8;
}

.store-image {
  position: relative;
  /* height: 200px; */
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 8px;
  background-color: #f56c6c;
  color: white;
  font-size: 14px;
}

.status-badge.open {
  background-color: #67c23a;
}

.store-info {
  padding: 16px;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.store-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.service-type {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.rating {
  margin-bottom: 12px;
}

.description {
  margin: 0;
  font-size: 14px;
  color: #5c6b7c;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>