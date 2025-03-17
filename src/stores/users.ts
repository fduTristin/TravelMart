import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {User} from '@/types/user'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('users', () => {
  // 状态
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取所有项目
  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getAll()
      users.value = response.data
    } catch (e) {
      error.value = 'Failed to fetch data'
      console.error('Failed to fetch users:', e)
      throw e 
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    users,
    loading,
    error,
    // 操作方法
    fetchUsers,
  }
}) 