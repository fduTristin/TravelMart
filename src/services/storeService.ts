import { api } from './api'
import type { Store, CreateStoreDTO } from '@/types/store'
import { useAuthStore } from '@/stores/auth'

export const storeService = {
  // 获取所有店铺
  getAll: async () => {
    console.log('Fetching all stores...')
    const token = useAuthStore().token;
    console.log(`Token: ${token}`)
    return await api.get<Store[]>('/stores', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // 创建店铺
  createStore: async (data: CreateStoreDTO) => {
    try {
      const authStore = useAuthStore()

      // 确保用户已登录
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      const response = await api.post<Store>('/stores', data, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      if (response.data) {
        const newStore = response.data
        return newStore
      } else {
        throw new Error('创建店铺失败,服务器未返回数据')
      }
    } catch (error) {
      console.error('创建店铺失败:', error)
      throw error
    }
  }
}