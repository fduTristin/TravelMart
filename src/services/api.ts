import axios from 'axios'
import type { AxiosInstance } from 'axios'

// 创建 axios 实例
export const api: AxiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL, // for development
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('Response Error:', error.response?.data || error)
    const errors = error.response?.data?.errors
    if (errors && Array.isArray(errors)) {
      const errorMessages = errors.map((err: { reason: string }) => err.reason).join('; ')
      throw new Error(errorMessages)
    }
    throw error
  }
)
