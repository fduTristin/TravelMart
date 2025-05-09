import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Store, CreateStoreDTO } from '@/types/store'
import { storeService } from '@/services/storeService'

// 服务类型枚举
export enum ServiceType {
  HOTEL = '酒店',
  TRANSPORT = '交通',
  RESTAURANT = '餐饮',
  TICKET = '景区门票'
}

export const useStoreStore = defineStore('store', () => {
  // 状态
  const stores = ref<Store[]>([])
  const currentStoreIndex = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 从后端获取店铺列表
  const fetchStores = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await storeService.getAll()
      stores.value = response.data.map(store => ({
        ...store,
        imageUrl: store.imageUrl || '/restaurant.jpg' // 设置默认图片
      }))
      console.log('获取店铺列表成功:', stores.value)
      return stores.value
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取店铺列表失败'
      error.value = errorMsg
      console.error('获取店铺列表失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取当前店铺
  const currentStore = () => stores.value[currentStoreIndex.value]

  // 获取下一个店铺
  const nextStore = () => {
    currentStoreIndex.value = (currentStoreIndex.value + 1) % stores.value.length
    return currentStore()
  }

  // 获取随机店铺
  const getRandomStore = () => {
    if (stores.value.length === 0) return null // 如果 stores 为空，返回 null
    const randomIndex = Math.floor(Math.random() * stores.value.length)
    currentStoreIndex.value = randomIndex
    return currentStore()
  }

  // 获取指定服务类型的店铺列表
  const getStoresByType = (category: ServiceType) => {
    return stores.value.filter(store => store.categories.includes(category))
  }

  // 获取指定服务类型的随机店铺
  const getRandomStoreByType = (type: ServiceType) => {
    const filteredStores = getStoresByType(type)
    if (filteredStores.length === 0) return null
    const randomIndex = Math.floor(Math.random() * filteredStores.length)
    return filteredStores[randomIndex]
  }

  // 获取上一个店铺
  const prevStore = () => {
    currentStoreIndex.value = (currentStoreIndex.value - 1 + stores.value.length) % stores.value.length
    return currentStore()
  }

  // 创建新店铺
  const createStore = async (data: CreateStoreDTO) => {
    try {
      loading.value = true
      error.value = null
      const newStore = await storeService.createStore(data)
      newStore.imageUrl = newStore.imageUrl || '/restaurant.jpg' // 设置默认图片
      stores.value.push(newStore)
      console.log('新建店铺成功:', stores.value)
      return newStore
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取店铺列表失败'
      error.value = errorMsg
      console.error('新建店铺失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stores,
    loading,
    error,
    currentStore,
    nextStore,
    prevStore,
    getRandomStore,
    getStoresByType,
    getRandomStoreByType,
    createStore,
    fetchStores
  }
})
