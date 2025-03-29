import { api } from './api'
import type { User } from '@/types/user'

export const userService = {
  // 获取所有项目
  getAll: async () => {
    console.log('Fetching all users...')
    const token = ''; 
    return await api.get<User[]>('/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },

  getById: async (id: number) => {
    console.log(`Fetching user with ID: ${id}`)
    const token = '';
    return await api.get<User>(`/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}