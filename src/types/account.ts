import type { User } from '@/types/user'

export interface Account {
    accountBalance: number
    accountStatus: string
}

export interface AccountBalanceUpdateForm {
    amountIncrement: number
}

