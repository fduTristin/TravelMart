import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Account, AccountBalanceUpdateDTO } from '@/types/account'
import { accountService } from '@/services/accountService'

export const useAccountStore = defineStore('accounts', () => {

    // 状态
    const currentAccount = ref<Account>({
        accountStatus: '',
        accountBalance: 0
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 获取当前账户
    async function fetchCurrentAccount() {
        loading.value = true
        error.value = null
        try {
            const response = await accountService.getCurrentAccount()
            currentAccount.value = response.data
        } catch (e) {
            error.value = 'Failed to fetch data'
            console.error('Failed to fetch account:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    // 账户充值
    async function updateAccountBalance(accountdata: AccountBalanceUpdateDTO) {
        loading.value = true
        error.value = null
        try {
            const response = await accountService.updateAccountBalance(accountdata)
            currentAccount.value = response.data
        } catch (e) {
            error.value = 'Failed to update account balance'
            console.error('Failed to update account balance:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        currentAccount,
        loading,
        error,
        fetchCurrentAccount,
        updateAccountBalance,
    }
})