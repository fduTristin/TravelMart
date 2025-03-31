import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// 服务类型枚举
export enum ServiceType {
  HOTEL = '酒店',
  TRANSPORT = '交通',
  RESTAURANT = '餐饮',
  TICKET = '景区门票'
}

interface Store {
  storeId: number
  storeName: string
  rating: number
  isOpen: boolean
  description?: string
  imageUrl?: string
  serviceType: ServiceType
  // ownerId?: number 这个字段在数据模型中还没有，需要后端支持
}

// 创建店铺的DTO接口
interface CreateStoreDTO {
  storeName: string
  serviceTypes: ServiceType[]
  idNumber: string
  description: string
  address: string
  capital: number
  registrationDate: string
}

export const useStoreStore = defineStore('store', () => {
  // 状态
  const stores = ref<Store[]>([
    // 餐饮类
    {
      storeId: 1,
      storeName: '江南小馆',
      rating: 4.8,
      isOpen: true,
      description: '正宗江南菜，精选时令食材，提供私密包间',
      imageUrl: 'https://th.bing.com/th/id/OIP.U7H_4iBujVitOVTbqytUkwHaF5?w=250&h=199&c=7&r=0&o=5&dpr=1.5&pid=1.7',
      serviceType: ServiceType.RESTAURANT
    },
    // {
    //   storeId: 2,
    //   storeName: '星级火锅',
    //   rating: 4.9,
    //   isOpen: true,
    //   description: '高端火锅，独特锅底，新鲜食材，干净卫生',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.RESTAURANT
    // },
    // {
    //   storeId: 3,
    //   storeName: '深夜食堂',
    //   rating: 4.5,
    //   isOpen: false,
    //   description: '深夜美食天堂，提供宵夜和简餐',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.RESTAURANT
    // },
    // {
    //   storeId: 4,
    //   storeName: '甜蜜糕点',
    //   rating: 4.7,
    //   isOpen: true,
    //   description: '法式甜点，手工蛋糕，下午茶首选',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.RESTAURANT
    // },
    // 酒店类
    {
      storeId: 5,
      storeName: '豪华国际酒店',
      rating: 4.9,
      isOpen: true,
      description: '五星级酒店，豪华套房，商务中心，健身房',
      imageUrl: 'https://th.bing.com/th/id/OIP.wjRRa6yBxPzXDNBzS7jB0wHaHa?w=202&h=202&c=7&r=0&o=5&dpr=1.5&pid=1.7',
      serviceType: ServiceType.HOTEL
    },
    // {
    //   storeId: 6,
    //   storeName: '温馨民宿',
    //   rating: 4.6,
    //   isOpen: true,
    //   description: '家庭式民宿，独特装修风格，便捷地理位置',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.HOTEL
    // },
    // {
    //   storeId: 7,
    //   storeName: '商务精品酒店',
    //   rating: 4.7,
    //   isOpen: true,
    //   description: '商务出行首选，高速网络，会议室设施齐全',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.HOTEL
    // },
    // 交通类
    {
      storeId: 8,
      storeName: '城际快线',
      rating: 4.8,
      isOpen: true,
      description: '城际快速通勤，准时可靠，舒适体验',
      imageUrl: 'https://th.bing.com/th/id/OIP.xnOUbAZ4DuN6gwJJ6GNcwAHaE6?w=248&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7',
      serviceType: ServiceType.TRANSPORT
    },
    // {
    //   storeId: 9,
    //   storeName: '豪华租车',
    //   rating: 4.6,
    //   isOpen: true,
    //   description: '高端车型出租，专业司机，商务接待',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.TRANSPORT
    // },
    // {
    //   storeId: 10,
    //   storeName: '观光巴士',
    //   rating: 4.5,
    //   isOpen: true,
    //   description: '城市观光线路，专业导游，舒适车厢',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.TRANSPORT
    // },
    // 景区门票类
    {
      storeId: 11,
      storeName: '古城景区',
      rating: 4.9,
      isOpen: true,
      description: '千年古城，文化遗产，导游讲解',
      imageUrl: 'https://th.bing.com/th/id/OIP.M95dY4kPyCAaTOWYbXftBAHaE8?w=255&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7',
      serviceType: ServiceType.TICKET
    },
    // {
    //   storeId: 12,
    //   storeName: '主题乐园',
    //   rating: 4.7,
    //   isOpen: true,
    //   description: '刺激游乐设施，主题表演，亲子娱乐',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.TICKET
    // },
    // {
    //   storeId: 13,
    //   storeName: '自然公园',
    //   rating: 4.8,
    //   isOpen: true,
    //   description: '自然风光，野生动物，户外活动',
    //   imageUrl: 'https://via.placeholder.com/400x300',
    //   serviceType: ServiceType.TICKET
    // }
  ])
  const currentStoreIndex = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 从后端获取店铺列表
  const fetchStores = async () => {
    try {
      loading.value = true
      error.value = null
      const authStore = useAuthStore()

      const headers: Record<string, string> = {}
      if (authStore.token) {
        headers.Authorization = `Bearer ${authStore.token}`
      }

      const response = await api.get('/api/stores', { headers })
      stores.value = response.data
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

  // 获取商户自己的店铺列表
  const fetchMerchantStores = async () => {
    try {
      loading.value = true
      error.value = null
      const authStore = useAuthStore()

      // 确保用户已登录
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      // 设置请求头中的 token
      const response = await api.get('/api/stores/merchant', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      stores.value = response.data
      return stores.value
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取店铺列表失败'
      error.value = errorMsg
      console.error('获取商户店铺列表失败:', err)
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
    const randomIndex = Math.floor(Math.random() * stores.value.length)
    currentStoreIndex.value = randomIndex
    return currentStore()
  }

  // 获取指定服务类型的店铺列表
  const getStoresByType = (type: ServiceType) => {
    return stores.value.filter(store => store.serviceType === type)
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
      const authStore = useAuthStore()

      // 确保用户已登录
      if (!authStore.token) {
        throw new Error('用户未登录')
      }

      // 设置请求头中的 token
      const response = await api.post('/api/stores', data, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      // 如果后端返回创建的店铺信息,使用后端返回的数据
      if (response.data) {
        const newStore: Store = {
          storeId: response.data.storeId,
          storeName: response.data.storeName,
          rating: response.data.rating || 5.0, // 如果后端未返回评分,使用默认评分
          isOpen: response.data.isOpen || true,
          description: response.data.description,
          imageUrl: response.data.imageUrl || 'https://via.placeholder.com/400x300',
          serviceType: response.data.serviceTypes[0] // 暂时只使用第一个服务类型
        }

        // 添加到本地状态中
        stores.value.push(newStore)
        return newStore
      } else {
        throw new Error('创建店铺失败,服务器未返回数据')
      }
    } catch (error) {
      console.error('创建店铺失败:', error)
      throw error
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
    fetchStores,
    fetchMerchantStores
  }
})
