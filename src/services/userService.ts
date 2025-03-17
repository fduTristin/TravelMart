import { api } from './api'
import type { User } from '@/types/user'

export const userService = {
  // 获取所有项目
  getAll: async () => {
    console.log('Fetching all users...')
    return await api.get<User[]>('/lab1/users')
  },
} 