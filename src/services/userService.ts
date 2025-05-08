import { api } from './api'
import type { User, UpdateUserForm } from '@/types/user'
import { useAuthStore } from '@/stores/auth'

export const userService = {
  // 获取所有用户
  getAll: async () => {
    console.log('Fetching all users...')
    const token = useAuthStore().token;
    console.log(`Token: ${token}`)
    return await api.get<User[]>('/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  //获取ID对应用户
  getById: async (id: number) => {
    console.log(`Fetching user with ID: ${id}`)
    const token = '';
    return await api.get<User>(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // 获取当前用户
  getCurrentUser: async () => {
    const token = useAuthStore().token;
    return await api.get<User>('/users/me/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  // 更新用户
  updateUser: async (userData: UpdateUserForm) => {
    const token = useAuthStore().token;
    try {
      return await api.patch(`/users/me/profile`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error: any) {
      throw error
    }
  },
}
