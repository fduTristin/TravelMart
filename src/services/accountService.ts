import { api } from './api'
import type { Account, AccountBalanceUpdateForm } from '@/types/account'
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

    // 账户充值
    updateAccountBalance: async (accountdata: AccountBalanceUpdateForm) => {
        const token = useAuthStore().token
        return await api.post<Account>('/users/me/account/balance', accountdata,{
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
    },
}
