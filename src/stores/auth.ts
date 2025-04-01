import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub: string
  userRole: 'ADMIN' | 'MERCHANT' | 'CUSTOMER'
  iat: number
  exp: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  // 从token中解析用户信息
  const user = computed(() => {
    if (!token.value) return null
    try {
      return jwtDecode<JwtPayload>(token.value)
    } catch {
      return null
    }
  })

  // 用户角色
  const role = computed(() => user.value?.userRole || null)

  // 是否是商户
  const isMerchant = computed(() => role.value === 'MERCHANT')

  // 是否是管理员
  const isAdmin = computed(() => role.value === 'ADMIN')

  // 是否已登录
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 设置token
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 登出
  const logout = () => {
    setToken(null)
  }

  return {
    token,
    user,
    role,
    isMerchant,
    isAdmin,
    isAuthenticated,
    setToken,
    logout
  }
})
