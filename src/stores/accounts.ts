import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UpdateUserForm } from '@/types/user'
import type { Account } from '@/types/account'
import { accountService } from '@/services/accountService'

export const useAccountStore = defineStore('accounts', () => {

    // 状态
    const accountSelf = ref<Account | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 获取当前账户
    async function fetchCurrentAccount() {
        loading.value = true
        error.value = null
        try {
            const response = await accountService.getCurrentAccount()
            accountSelf.value = response.data
        } catch (e) {
            error.value = 'Failed to fetch data'
            console.error('Failed to fetch account:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        accountSelf,
        loading,
        error,
        fetchCurrentAccount,
    }
})