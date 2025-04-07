import { api } from './api'
import type { Store } from '@/types/store'
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
}