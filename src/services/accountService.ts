import { api } from './api'
import type { User, UpdateUserForm } from '@/types/user'
import type { Account } from '@/types/account'
import { useAuthStore } from '@/stores/auth'

export const accountService = {
    
    // 获取当前用户的账户信息
    getCurrentAccount: async () => {
        const token = useAuthStore().token
        return await api.get<Account>('/users/me/account', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
    },


}
