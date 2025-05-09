import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UpdateUserDTO } from '@/types/user'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('users', () => {
  // 状态
  const users = ref<User[]>([])
  const currentUser = ref<User>({
    userId: 0,
    userName: '',
    userEmail: '',
    userRole: '',
    userTel: '',
    userBio: '',
  })
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

  // 获取单个项目
  async function fetchUserById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getById(id)
      const user = response.data
      const index = users.value.findIndex((u) => u.userId === user.userId)
      if (index !== -1) {
        users.value[index] = user
      } else {
        users.value.push(user)
      }
    } catch (e) {
      error.value = 'Failed to fetch data'
      console.error('Failed to fetch user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // 获取当前用户
  async function fetchCurrentUser() {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getCurrentUser()
      currentUser.value = response.data
    } catch (e) {
      error.value = 'Failed to fetch data'
      console.error('Failed to fetch user:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // 更新用户
  async function updateUser(userData: UpdateUserDTO) {
    loading.value = true
    error.value = null
    try {
      const response = await userService.updateUser(userData)
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    users,
    currentUser,
    loading,
    error,
    // 操作方法
    fetchUsers,
    fetchUserById,
    fetchCurrentUser,
    updateUser,
  }
}) 