import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { api } from '@/services/api'
import type { AxiosError } from 'axios'

interface JwtPayload {
  sub: string
  userRole: 'ADMIN' | 'MERCHANT' | 'CUSTOMER'
  iat: number
  exp: number
}

interface LoginCredentials {
  userName: string
  userPwd: string
}

interface RegisterData {
  userName: string
  userPwd: string
  userRole: 'ADMIN' | 'MERCHANT' | 'CUSTOMER'
  userEmail: string
  userTel: string
}

interface ErrorResponse {
  status: number
  message: string
  error: string
  errors: null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  // 登录
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      // 调用登录API
      const response = await api.post('/auth/login', credentials)

      // 保存用户名，方便下次登录
      localStorage.setItem('lastUsername', credentials.userName)

      // 保存token
      setToken(response.data.token)

      return response.data
    } catch (err: unknown) {
      // 处理错误响应
      const axiosError = err as AxiosError<ErrorResponse>
      if (axiosError.response?.data?.message) {
        error.value = axiosError.response.data.message
      } else {
        error.value = '登录失败'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      // 调用注册API
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (err: unknown) {
      // 处理错误响应
      const axiosError = err as AxiosError<ErrorResponse>
      if (axiosError.response?.data?.message) {
        error.value = axiosError.response.data.message
      } else {
        error.value = '注册失败'
      }
      throw err
    } finally {
      loading.value = false
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
    loading,
    error,
    setToken,
    login,
    register,
    logout
  }
})
